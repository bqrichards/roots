import go from 'gojs'
import type { PersonNode } from '../types/family.types'

// https://gojs.net/latest/samples/genogram.html

const bluegrad = '#90CAF9'
const pinkgrad = '#F48FB1'

// get tooltip text from the object's data
function tooltipTextConverter(person: PersonNode) {
	let str = ''
	str += 'Born: ' + person.birth?.date || '???'
	// if (person.deathYear !== undefined) str += '\nDied: ' + person.deathYear
	// if (person.reign !== undefined) str += '\nReign: ' + person.reign
	return str
}

// define Converters to be used for Bindings
function genderBrushConverter(gender: PersonNode['s']) {
	if (gender === 'M') return bluegrad
	if (gender === 'F') return pinkgrad
	return 'orange'
}

export function init(people: PersonNode[]) {
	// Since 2.2 you can also author concise templates with method chaining instead of GraphObject.make
	// For details, see https://gojs.net/latest/intro/buildingObjects.html
	const $ = go.GraphObject.make

	const myDiagram = $(go.Diagram, 'myDiagramDiv', {
		initialAutoScale: go.Diagram.Uniform,
		'undoManager.isEnabled': true,
		// when a node is selected, draw a big yellow circle behind it
		nodeSelectionAdornmentTemplate: $(
			go.Adornment,
			'Auto',
			{ layerName: 'Grid' }, // the predefined layer that is behind everything else
			$(go.Shape, 'Circle', { fill: '#c1cee3', stroke: null }),
			$(go.Placeholder, { margin: 2 })
		),
		// use a custom layout, defined below
		layout: $(GenogramLayout, {
			direction: 90,
			layerSpacing: 30,
			columnSpacing: 10,
		}),
	})

	// define tooltips for nodes
	const tooltiptemplate = $(
		'ToolTip',
		{ 'Border.fill': 'whitesmoke', 'Border.stroke': 'black' },
		$(
			go.TextBlock,
			{
				font: 'bold 8pt Helvetica, bold Arial, sans-serif',
				wrap: go.TextBlock.WrapFit,
				margin: 5,
			},
			new go.Binding('text', '', tooltipTextConverter)
		)
	)

	// two different node templates, one for each sex,
	// named by the category value in the node data object
	myDiagram.nodeTemplateMap.add(
		'M', // male
		$(
			go.Node,
			'Auto',
			{
				locationSpot: go.Spot.Center,
				toolTip: tooltiptemplate,
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
				new go.Binding('fill', 's', genderBrushConverter)
			),
			$(
				go.TextBlock,
				{
					font: '700 12px Droid Serif, sans-serif',
					textAlign: 'center',
					margin: 10,
					maxSize: new go.Size(80, NaN),
				},
				new go.Binding('text', 'n')
			)
		)
	)

	myDiagram.nodeTemplateMap.add(
		'F', // female
		$(
			go.Node,
			'Auto',
			{
				locationSpot: go.Spot.Center,
				toolTip: tooltiptemplate,
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
				new go.Binding('fill', 's', genderBrushConverter)
			),
			$(
				go.TextBlock,
				{
					font: '700 12px Droid Serif, sans-serif',
					textAlign: 'center',
					margin: 10,
					maxSize: new go.Size(80, NaN),
				},
				new go.Binding('text', 'n')
			)
		)
	)

	// the representation of each label node -- nothing shows on a Marriage Link
	myDiagram.nodeTemplateMap.add(
		'LinkLabel',
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
		'Marriage',
		$(go.Link, { selectable: false, routing: go.Link.Orthogonal }, $(go.Shape, { strokeWidth: 2.5, stroke: '#6a0dad' }))
	)

	setupDiagram(myDiagram, people)
}

/**
 * create and initialize the Diagram.model given an array of node data representing people
 * @param diagram diagram
 * @param people people
 * @param focusId focus on this person
 */
function setupDiagram(diagram: go.Diagram, people: PersonNode[], focusId?: number) {
	diagram.model = new go.GraphLinksModel({
		// declare support for link label nodes
		linkLabelKeysProperty: 'labelKeys',
		// this property determines which template is used
		nodeCategoryProperty: 's',
		// if a node data object is copied, copy its data.a Array
		copiesArrays: true,
		// create all of the nodes for people
		nodeDataArray: people,
	})

	setupMarriages(diagram)
	setupParents(diagram)

	const node = diagram.findNodeForKey(focusId)
	if (node !== null) {
		diagram.select(node)
		// remove any spouse for the person under focus:
		//node.linksConnected.each(l => {
		//  if (!l.isLabeledLink) return;
		//  l.opacity = 0;
		//  const spouse = l.getOtherNode(node);
		//  spouse.opacity = 0;
		//  spouse.pickable = false;
		//});
	}
}

function findMarriage(diagram: go.Diagram, a: go.Key, b: go.Key) {
	// A and B are node keys
	const nodeA = diagram.findNodeForKey(a)
	const nodeB = diagram.findNodeForKey(b)
	if (nodeA !== null && nodeB !== null) {
		const it = nodeA.findLinksBetween(nodeB) // in either direction
		while (it.next()) {
			const link = it.value
			// Link.data.category === "Marriage" means it's a marriage relationship
			if (link.data !== null && link.data.category === 'Marriage') return link
		}
	}
	return null
}

/**
 * process the node data to determine marriages
 * @param diagram the diagram
 */
function setupMarriages(diagram: go.Diagram) {
	const model = diagram.model as go.GraphLinksModel
	const nodeDataArray = model.nodeDataArray as PersonNode[]
	for (let i = 0; i < nodeDataArray.length; i++) {
		const data = nodeDataArray[i]
		const key = data.key
		let wives: number | number[] = data.wife
		if (wives !== undefined) {
			if (typeof wives === 'number') wives = [wives]
			for (let j = 0; j < wives.length; j++) {
				const wife = wives[j]
				const wdata = model.findNodeDataForKey(wife) as PersonNode
				if (key === wife || !wdata || wdata.s !== 'F') {
					console.log('cannot create Marriage relationship with self or unknown person ' + wife)
					continue
				}
				const link = findMarriage(diagram, key, wife)
				if (link === null) {
					// add a label node for the marriage link
					const mlab = { s: 'LinkLabel', key: undefined }
					model.addNodeData(mlab)
					// add the marriage link itself, also referring to the label node
					const mdata = {
						from: key,
						to: wife,
						labelKeys: [mlab.key],
						category: 'Marriage',
					}
					model.addLinkData(mdata)
				}
			}
		}

		let husbands: number | number[] = data.husband
		if (husbands !== undefined) {
			if (typeof husbands === 'number') husbands = [husbands]
			for (let j = 0; j < husbands.length; j++) {
				const husband = husbands[j]
				const hdata = model.findNodeDataForKey(husband) as PersonNode
				if (key === husband || !hdata || hdata.s !== 'M') {
					console.log('cannot create Marriage relationship with self or unknown person ' + husband)
					continue
				}
				const link = findMarriage(diagram, key, husband)
				if (link === null) {
					// add a label node for the marriage link
					const mlab = { s: 'LinkLabel', key: undefined }
					model.addNodeData(mlab)
					// add the marriage link itself, also referring to the label node
					const mdata = {
						from: key,
						to: husband,
						labelKeys: [mlab.key],
						category: 'Marriage',
					}
					model.addLinkData(mdata)
				}
			}
		}
	}
}

/**
 * process parent-child relationships once all marriages are known
 * @param diagram the diagram
 */
function setupParents(diagram: go.Diagram) {
	const model = diagram.model as go.GraphLinksModel
	const nodeDataArray = model.nodeDataArray as PersonNode[]
	for (let i = 0; i < nodeDataArray.length; i++) {
		const data = nodeDataArray[i]
		const key = data.key
		const mother = data.m
		const father = data.f
		if (mother !== undefined && father !== undefined) {
			const link = findMarriage(diagram, mother, father)
			if (link === null) {
				// or warn no known mother or no known father or no known marriage between them
				console.log('unknown marriage: ' + mother + ' & ' + father)
				continue
			}
			const mdata = link.data
			if (mdata.labelKeys === undefined || mdata.labelKeys[0] === undefined) continue
			const mlabkey = mdata.labelKeys[0]
			const cdata = { from: mlabkey, to: key }
			model.addLinkData(cdata)
		}
	}
}

// A custom layout that shows the two families related to a person's parents
class GenogramLayout extends go.LayeredDigraphLayout {
	/** minimum space between spouses */
	spouseSpacing: number

	constructor() {
		super()
		this.initializeOption = go.LayeredDigraphLayout.InitDepthFirstIn
		this.spouseSpacing = 30
	}

	override makeNetwork(coll: go.Diagram | go.Group | go.Iterable<go.Part>): go.LayoutNetwork {
		// generate LayoutEdges for each parent-child Link
		const net = this.createNetwork()
		if (coll instanceof go.Diagram) {
			this.add(net, coll.nodes, true)
			this.add(net, coll.links, true)
		} else if (coll instanceof go.Group) {
			this.add(net, coll.memberParts, false)
		} else if (coll.iterator) {
			this.add(net, coll.iterator, false)
		}

		return net
	}

	// internal method for creating LayeredDigraphNetwork where husband/wife pairs are represented
	// by a single LayeredDigraphVertex corresponding to the label Node on the marriage Link
	add(net: go.LayeredDigraphNetwork, coll: go.Iterator<go.Node | go.Link | go.Part>, nonmemberonly: boolean) {
		const multiSpousePeople = new go.Set<go.Node>()
		// consider all Nodes in the given collection
		const it = coll.iterator
		while (it.next()) {
			const node = it.value
			if (!(node instanceof go.Node)) continue
			if (!node.isLayoutPositioned || !node.isVisible()) continue
			if (nonmemberonly && node.containingGroup !== null) continue
			// if it's an unmarried Node, or if it's a Link Label Node, create a LayoutVertex for it
			if (node.isLinkLabel) {
				// get marriage Link
				const link = node.labeledLink
				const spouseA = link.fromNode
				const spouseB = link.toNode
				// create vertex representing both husband and wife
				const vertex = net.addNode(node)
				// now define the vertex size to be big enough to hold both spouses
				vertex.width = spouseA.actualBounds.width + this.spouseSpacing + spouseB.actualBounds.width
				vertex.height = Math.max(spouseA.actualBounds.height, spouseB.actualBounds.height)
				vertex.focus = new go.Point(spouseA.actualBounds.width + this.spouseSpacing / 2, vertex.height / 2)
			} else {
				// don't add a vertex for any married person!
				// instead, code above adds label node for marriage link
				// assume a marriage Link has a label Node
				let marriages = 0
				node.linksConnected.each(l => {
					if (l.isLabeledLink) marriages++
				})
				if (marriages === 0) {
					net.addNode(node)
				} else if (marriages > 1) {
					multiSpousePeople.add(node)
				}
			}
		}

		// now do all Links
		it.reset()
		while (it.next()) {
			const link = it.value
			if (!(link instanceof go.Link)) continue
			if (!link.isLayoutPositioned || !link.isVisible()) continue
			if (nonmemberonly && link.containingGroup !== null) continue
			// if it's a parent-child link, add a LayoutEdge for it
			if (!link.isLabeledLink) {
				const parent = net.findVertex(link.fromNode) // should be a label node
				const child = net.findVertex(link.toNode)
				if (child !== null) {
					// an unmarried child
					net.linkVertexes(parent, child, link)
				} else {
					// a married child
					link.toNode.linksConnected.each(l => {
						if (!l.isLabeledLink) return // if it has no label node, it's a parent-child link
						// found the Marriage Link, now get its label Node
						const mlab = l.labelNodes.first()
						// parent-child link should connect with the label node,
						// so the LayoutEdge should connect with the LayoutVertex representing the label node
						const mlabvert = net.findVertex(mlab)
						if (mlabvert !== null) {
							net.linkVertexes(parent, mlabvert, link)
						}
					})
				}
			}
		}

		while (multiSpousePeople.count > 0) {
			// find all collections of people that are indirectly married to each other
			const node = multiSpousePeople.first()
			const cohort = new go.Set<go.Node>()
			this.extendCohort(cohort, node)
			// then encourage them all to be the same generation by connecting them all with a common vertex
			const dummyvert = net.createVertex()
			net.addVertex(dummyvert)
			const marriages = new go.Set<go.Link>()
			cohort.each(n => {
				n.linksConnected.each(l => {
					marriages.add(l)
				})
			})

			marriages.each(link => {
				// find the vertex for the marriage link (i.e. for the label node)
				const mlab = link.labelNodes.first()
				const v = net.findVertex(mlab)
				if (v !== null) {
					net.linkVertexes(dummyvert, v, null)
				}
			})

			// done with these people, now see if there are any other multiple-married people
			multiSpousePeople.removeAll(cohort)
		}
	}

	// collect all of the people indirectly married with a person
	extendCohort(coll: go.Set<go.Node>, node: go.Node) {
		if (coll.has(node)) return
		coll.add(node)
		node.linksConnected.each(l => {
			if (l.isLabeledLink) {
				// if it's a marriage link, continue with both spouses
				this.extendCohort(coll, l.fromNode)
				this.extendCohort(coll, l.toNode)
			}
		})
	}

	assignLayers() {
		super.assignLayers()
		const horiz = this.direction == 0.0 || this.direction == 180.0
		// for every vertex, record the maximum vertex width or height for the vertex's layer
		const maxsizes = []
		this.network.vertexes.each((v: go.LayeredDigraphVertex) => {
			const lay = v.layer
			let max = maxsizes[lay]
			if (max === undefined) max = 0
			const sz = horiz ? v.width : v.height
			if (sz > max) maxsizes[lay] = sz
		})

		// now make sure every vertex has the maximum width or height according to which layer it is in,
		// and aligned on the left (if horizontal) or the top (if vertical)
		this.network.vertexes.each((v: go.LayeredDigraphVertex) => {
			const lay = v.layer
			const max = maxsizes[lay]
			if (horiz) {
				v.focus = new go.Point(0, v.height / 2)
				v.width = max
			} else {
				v.focus = new go.Point(v.width / 2, 0)
				v.height = max
			}
		})
		// from now on, the LayeredDigraphLayout will think that the Node is bigger than it really is
		// (other than the ones that are the widest or tallest in their respective layer).
	}

	commitNodes() {
		super.commitNodes()
		// position regular nodes
		this.network.vertexes.each(v => {
			if (v.node !== null && !v.node.isLinkLabel) {
				v.node.moveTo(v.x, v.y)
			}
		})

		// position the spouses of each marriage vertex
		this.network.vertexes.each(v => {
			if (v.node === null) return
			if (!v.node.isLinkLabel) return
			const labnode = v.node
			const lablink = labnode.labeledLink
			// In case the spouses are not actually moved, we need to have the marriage link
			// position the label node, because LayoutVertex.commit() was called above on these vertexes.
			// Alternatively we could override LayoutVetex.commit to be a no-op for label node vertexes.
			lablink.invalidateRoute()
			let spouseA = lablink.fromNode
			let spouseB = lablink.toNode
			// prefer fathers on the left, mothers on the right
			if ((spouseA.data as PersonNode).s === 'F') {
				// sex is female
				const temp = spouseA
				spouseA = spouseB
				spouseB = temp
			}

			// see if the parents are on the desired sides, to avoid a link crossing
			const aParentsNode = this.findParentsMarriageLabelNode(spouseA)
			const bParentsNode = this.findParentsMarriageLabelNode(spouseB)
			if (aParentsNode !== null && bParentsNode !== null && aParentsNode.position.x > bParentsNode.position.x) {
				// swap the spouses
				const temp = spouseA
				spouseA = spouseB
				spouseB = temp
			}

			spouseA.moveTo(v.x, v.y)
			spouseB.moveTo(v.x + spouseA.actualBounds.width + this.spouseSpacing, v.y)
			if (spouseA.opacity === 0) {
				const pos = new go.Point(v.centerX - spouseA.actualBounds.width / 2, v.y)
				spouseA.move(pos)
				spouseB.move(pos)
			} else if (spouseB.opacity === 0) {
				const pos = new go.Point(v.centerX - spouseB.actualBounds.width / 2, v.y)
				spouseA.move(pos)
				spouseB.move(pos)
			}
		})

		// position only-child nodes to be under the marriage label node
		this.network.vertexes.each(v => {
			if (v.node === null || v.node.linksConnected.count > 1) return
			const mnode = this.findParentsMarriageLabelNode(v.node)
			if (mnode !== null && mnode.linksConnected.count === 1) {
				// if only one child
				const mvert = this.network.findVertex(mnode)
				const newbnds = v.node.actualBounds.copy()
				newbnds.x = mvert.centerX - v.node.actualBounds.width / 2
				// see if there's any empty space at the horizontal mid-point in that layer
				const overlaps = this.diagram.findObjectsIn(
					newbnds,
					x => x.part,
					p => p !== v.node,
					true
				)
				if (overlaps.count === 0) {
					v.node.move(newbnds.position)
				}
			}
		})
	}

	findParentsMarriageLabelNode(node: go.Node) {
		const it = node.findNodesInto()
		while (it.next()) {
			const n = it.value
			if (n.isLinkLabel) return n
		}
		return null
	}
}
// end GenogramLayout class
