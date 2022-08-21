import * as React from 'react'
import * as go from 'gojs'
import { ReactDiagram } from 'gojs-react'
import type { Family, OnPersonClickedFunction, PersonNode } from '../types/family.types'
import { GenogramLayout } from '../chart/GenogramLayout'

interface WrapperProps {
	skipsDiagramUpdate: boolean
	onDiagramEvent: (e: go.DiagramEvent) => void
	onModelChange: (e: go.IncrementalData) => void
	divId: string
	family: Family
	onPersonClicked: OnPersonClickedFunction
	onPersonEdit: OnPersonClickedFunction
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

	const { people, marriages } = props.family

	const linkCount = React.useRef(-1)

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
	const initDiagram = React.useCallback((): go.Diagram => {
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

		return myDiagram
	}, [])

	// process the node data to determine marriage and child relationships
	const { marriageLabelNodes, linkDataArray } = React.useMemo(() => {
		const labelNodes: MarriageLabelObject[] = []
		const linkNodes: go.ObjectData[] = []

		for (const { one, two, children } of marriages) {
			// Check if person exist
			if (one === two || !people.find(person => person.key === two)) {
				console.log('cannot create Marriage relationship with self or unknown person ' + two)
				continue
			}

			// add a label node for the marriage link
			const labelData: MarriageLabelObject = { gender: MARRIAGE_LINK_KEY, key: linkCount.current }
			labelNodes.push(labelData)

			linkCount.current--

			// add the marriage link itself, also referring to the label node
			const linkData: MarriageLink = {
				from: one,
				to: two,
				labelKeys: [labelData.key],
				category: MARRIAGE_LINK_CATEGORY,
			}
			linkNodes.push(linkData)

			// Process parent-child relationship once marriage is known
			for (const child of children) {
				if (linkData.labelKeys === undefined || linkData.labelKeys[0] === undefined) continue
				const marriageLabelKey = linkData.labelKeys[0]
				const cdata: go.ObjectData = { from: marriageLabelKey, to: child }
				linkNodes.push(cdata)
			}
		}

		return { marriageLabelNodes: labelNodes, linkDataArray: linkNodes }
	}, [people])

	const nodeDataArray = React.useMemo(() => [...people, ...marriageLabelNodes], [people, marriageLabelNodes])

	return (
		<ReactDiagram
			ref={diagramRef}
			style={reactDiagramStyle}
			divClassName={props.divId}
			initDiagram={initDiagram}
			nodeDataArray={nodeDataArray}
			linkDataArray={linkDataArray}
			onModelChange={props.onModelChange}
			skipsDiagramUpdate={props.skipsDiagramUpdate}
		/>
	)
}

const reactDiagramStyle: React.CSSProperties = { backgroundColor: '#eee', width: '100%', height: '100%' }
