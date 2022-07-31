import * as React from 'react'
import * as go from 'gojs'
import { ReactDiagram } from 'gojs-react'
import type { OnPersonClickedFunction, PersonNode } from '../types/family.types'
import { GenogramLayout } from '../chart/GenogramLayout'

interface WrapperProps {
	skipsDiagramUpdate: boolean
	onDiagramEvent: (e: go.DiagramEvent) => void
	onModelChange: (e: go.IncrementalData) => void
	divId: string
	people: PersonNode[]
	onPersonClicked: OnPersonClickedFunction
}

const bluegrad = '#90CAF9'
const pinkgrad = '#F48FB1'

const MARRIAGE_LINK_CATEGORY = 'Marriage'
const MARRIAGE_LINK_KEY = 'LinkLabel'

function genderBrushConverter(gender: PersonNode['gender']) {
	if (gender === 'M') return bluegrad
	if (gender === 'F') return pinkgrad
	return 'orange'
}

const PERSON_NAME_KEY: keyof PersonNode = 'name'

interface MarriageLabelObject {
	gender: string
	key?: number
}

interface MarriageLink {
	from: number
	to: number
	labelKeys: number[]
	category: string
}

export const DiagramWrapper: React.FC<WrapperProps> = props => {
	/**
	 * Ref to keep a reference to the component, which provides access to the GoJS diagram via getDiagram().
	 */
	const diagramRef = React.useRef<ReactDiagram>(null)

	const linkCount = React.useRef(-1)

	// const linkDataArray = React.useState<go.ObjectData[]>([])

	/**
	 * Get the diagram reference and add any desired diagram listeners.
	 * Typically the same function will be used for each listener,
	 * with the function using a switch statement to handle the events.
	 * This is only necessary when you want to define additional app-specific diagram listeners.
	 */
	React.useEffect(() => {
		if (!diagramRef.current) return
		const diagram = diagramRef.current.getDiagram()
		if (diagram instanceof go.Diagram) {
			diagram.addDiagramListener('ChangedSelection', props.onDiagramEvent)
		}

		/**
		 * Get the diagram reference and remove listeners that were added during mounting.
		 * This is only necessary when you have defined additional app-specific diagram listeners.
		 */
		return () => {
			if (!diagramRef.current) return
			const diagram = diagramRef.current.getDiagram()
			if (diagram instanceof go.Diagram) {
				diagram.removeDiagramListener('ChangedSelection', props.onDiagramEvent)
			}
		}
	}, [])

	/**
	 * Diagram initialization method, which is passed to the ReactDiagram component.
	 * This method is responsible for making the diagram and initializing the model, any templates,
	 * and maybe doing other initialization tasks like customizing tools.
	 * The model's data should not be set here, as the ReactDiagram component handles that via the other props.
	 */
	const initDiagram = (): go.Diagram => {
		// Since 2.2 you can also author concise templates with method chaining instead of GraphObject.make
		// For details, see https://gojs.net/latest/intro/buildingObjects.html
		const $ = go.GraphObject.make

		function onNodePress(_e: go.InputEvent, nodeObj: go.GraphObject) {
			const person = nodeObj.part.data as PersonNode
			props.onPersonClicked(person)
		}

		function focusPerson(_e: go.InputEvent, nodeObj: go.GraphObject) {
			const person = nodeObj.part.data as PersonNode
			alert(person.name)
		}

		const myDiagram = $(go.Diagram, props.divId, {
			initialAutoScale: go.Diagram.Uniform,
			'undoManager.isEnabled': true,
			model: new go.GraphLinksModel({
				linkKeyProperty: 'key',
				// declare support for link label nodes
				linkLabelKeysProperty: 'labelKeys',
				// this property determines which template is used
				nodeCategoryProperty: 'gender',
				// if a node data object is copied, copy its data.a Array
				// copiesArrays: true,
				// create all of the nodes for people
				// nodeDataArray: props.people,
				// positive keys for nodes
				makeUniqueKeyFunction: (m: go.Model, data: PersonNode) => {
					let k = data.key || 1
					while (m.findNodeDataForKey(k)) k++
					data.key = k
					return k
				},
				// negative keys for links
				makeUniqueLinkKeyFunction: (m: go.GraphLinksModel, data: PersonNode) => {
					let k = data.key || -1
					while (m.findLinkDataForKey(k)) k--
					data.key = k
					return k
				},
			}),
			// use a custom layout, defined below
			layout: $(GenogramLayout, {
				direction: 90,
				layerSpacing: 30,
				columnSpacing: 10,
			}),
		})

		myDiagram.nodeTemplate = $(
			go.Node,
			'Auto',
			{
				locationSpot: go.Spot.Center,
				click: onNodePress,
				contextMenu: $(
					'ContextMenu',
					$(
						'ContextMenuButton',
						{
							'ButtonBorder.fill': 'white',
							_buttonFillOver: 'skyblue',
						},
						$(go.TextBlock, 'Focus'),
						{ click: focusPerson }
					)
					// more ContextMenuButtons would go here
				), // end Adornment
			},
			$(
				go.Shape,
				'Rectangle',
				{
					fill: 'lightgray',
					stroke: null,
					strokeWidth: 0,
					stretch: go.GraphObject.Fill,
					alignment: go.Spot.Center,
				},
				new go.Binding('fill', 'gender', genderBrushConverter)
			),
			$(
				go.TextBlock,
				{
					font: '700 12px Droid Serif, sans-serif',
					textAlign: 'center',
					margin: 10,
					maxSize: new go.Size(80, NaN),
				},
				new go.Binding('text', PERSON_NAME_KEY)
			)
		)

		// the representation of each label node -- nothing shows on a Marriage Link
		myDiagram.nodeTemplateMap.add(
			MARRIAGE_LINK_KEY,
			$(go.Node, {
				selectable: false,
				width: 1,
				height: 1,
				fromEndSegmentLength: 20,
			})
		)

		// for parent-child relationships
		myDiagram.linkTemplate = $(
			go.Link,
			{ selectable: false, routing: go.Link.Orthogonal, corner: 5 },
			$(go.Shape, { strokeWidth: 3, stroke: '#424242' })
		)

		// for marriage relationships
		myDiagram.linkTemplateMap.add(
			MARRIAGE_LINK_CATEGORY,
			$(
				go.Link,
				{ selectable: false, routing: go.Link.Orthogonal },
				$(go.Shape, { strokeWidth: 2.5, stroke: '#6a0dad' })
			)
		)

		// setupDiagram(myDiagram)

		return myDiagram
	}

	/** process the node data to determine marriages */
	const { marriageLabelNodes, marriageLinkNodes } = React.useMemo(() => {
		const labelNodes: MarriageLabelObject[] = []
		const linkNodes: MarriageLink[] = []

		for (const personNode of props.people) {
			// setupPartners
			const personKey = personNode.key
			let partnersKeys: number | number[] | undefined = personNode.partner
			if (partnersKeys === undefined) continue

			if (typeof partnersKeys === 'number') partnersKeys = [partnersKeys]
			for (const partnerKey of partnersKeys) {
				const partner = props.people.find(person => person.key === partnerKey)
				if (personKey === partnerKey || !partner) {
					console.log('cannot create Marriage relationship with self or unknown person ' + partnerKey)
					continue
				}

				// Check if connection is already made in either direction
				const linkExists = linkNodes.some(
					linkNode =>
						(linkNode.from === personKey && linkNode.to === partnerKey) ||
						(linkNode.from === partnerKey && linkNode.to === personKey)
				)
				if (linkExists) continue

				// add a label node for the marriage link
				const labelData: MarriageLabelObject = { gender: MARRIAGE_LINK_KEY, key: linkCount.current }
				// model.addNodeData(marriageLabelData)
				labelNodes.push(labelData)

				linkCount.current--

				// add the marriage link itself, also referring to the label node
				const linkData: MarriageLink = {
					from: personKey,
					to: partnerKey,
					labelKeys: [labelData.key],
					category: MARRIAGE_LINK_CATEGORY,
				}
				// model.addLinkData(marriageLinkData)
				linkNodes.push(linkData)
				// setState(prev => ({ ...prev, linkDataArray: [...prev.linkDataArray, marriageLinkData] }))
			}
		}

		return { marriageLabelNodes: labelNodes, marriageLinkNodes: linkNodes }
	}, [props.people])

	const nodeDataArray = React.useMemo(
		() => [...props.people, ...marriageLabelNodes],
		[props.people, marriageLabelNodes]
	)

	console.log('Nodes', marriageLabelNodes, marriageLinkNodes)

	// /**
	//  * create and initialize the Diagram.model given an array of node data representing people
	//  * @param diagram diagram
	//  * @param focusId focus on this person
	//  */
	// const setupDiagram = (diagram: go.Diagram, focusId?: number) => {
	// 	setupParents(diagram)

	// 	const node = diagram.findNodeForKey(focusId)
	// 	if (node !== null) {
	// 		diagram.select(node)
	// 		// remove any spouse for the person under focus:
	// 		//node.linksConnected.each(l => {
	// 		//  if (!l.isLabeledLink) return;
	// 		//  l.opacity = 0;
	// 		//  const spouse = l.getOtherNode(node);
	// 		//  spouse.opacity = 0;
	// 		//  spouse.pickable = false;
	// 		//});
	// 	}
	// }

	// const findMarriage = (diagram: go.Diagram, a: go.Key, b: go.Key): { data: MarriageLink } | null => {
	// 	const nodeA = diagram.findNodeForKey(a)
	// 	const nodeB = diagram.findNodeForKey(b)
	// 	if (nodeA !== null && nodeB !== null) {
	// 		const it = nodeA.findLinksBetween(nodeB) // in either direction
	// 		while (it.next()) {
	// 			const link = it.value
	// 			// Check for marriage link
	// 			if (link.data !== null && link.data.category === MARRIAGE_LINK_CATEGORY) return link
	// 		}
	// 	}
	// 	return null
	// }

	// /**
	//  * process parent-child relationships once all marriages are known
	//  * @param diagram the diagram
	//  */
	const parentsLinkNodes = React.useMemo(() => {
		const linkNodes: go.ObjectData[] = []

		for (const data of props.people) {
			const childNode = data.key
			const mother = data.mom
			const father = data.dad
			if (mother === undefined || father === undefined) continue

			const marriageLinkData = marriageLinkNodes.find(
				marriageLinkNode => marriageLinkNode.from === mother && marriageLinkNode.to === father
			)

			if (!marriageLinkData) {
				// or warn no known mother or no known father or no known marriage between them
				console.log('unknown marriage: ' + mother + ' & ' + father)
				continue
			}

			if (marriageLinkData.labelKeys === undefined || marriageLinkData.labelKeys[0] === undefined) continue
			const marriageLabelKey = marriageLinkData.labelKeys[0]
			const cdata: go.ObjectData = { from: marriageLabelKey, to: childNode }
			linkNodes.push(cdata)
		}

		return linkNodes
	}, [props.people])

	const linkDataArray = React.useMemo(
		() => [...marriageLinkNodes, ...parentsLinkNodes],
		[marriageLinkNodes, parentsLinkNodes]
	)

	return (
		<ReactDiagram
			ref={diagramRef}
			style={{ backgroundColor: '#eee', width: '100%', height: '100%' }}
			divClassName={props.divId}
			initDiagram={initDiagram}
			nodeDataArray={nodeDataArray}
			linkDataArray={linkDataArray}
			onModelChange={props.onModelChange}
			skipsDiagramUpdate={props.skipsDiagramUpdate}
		/>
	)
}
