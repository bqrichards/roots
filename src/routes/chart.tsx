import { useCallback, useState } from 'react'
import '../styles/chart.scss'
import type { Family, PersonNode } from '../types/family.types'
import { PersonInfoDrawer } from '../components/PersonInfoDrawer'
import { DiagramWrapper } from '../components/DiagramWrapper'
import { EditPersonInfoDrawer } from 'components/EditPersonInfoDrawer'

interface ChartProps {
	family: Family | null
}

export default function Chart({ family }: ChartProps) {
	const { addresses = [], pets = [] } = family || {}
	const [selectedPerson, setSelectedPerson] = useState<PersonNode | null>(null)
	const [editingPerson, setEditingPerson] = useState<PersonNode | null>(null)

	const onPersonClicked = useCallback((person: PersonNode) => {
		setSelectedPerson(person)
	}, [])

	const onPersonClosed = useCallback(() => {
		setSelectedPerson(null)
	}, [])

	const onEditPersonClosed = useCallback(() => {
		setEditingPerson(null)
	}, [])

	/**
	 * Handle any app-specific DiagramEvents, in this case just selection changes.
	 * On ChangedSelection, find the corresponding data and set the selectedKey state.
	 *
	 * This is not required, and is only needed when handling DiagramEvents from the GoJS diagram.
	 * @param e a GoJS DiagramEvent
	 */
	const handleDiagramEvent = useCallback((e: go.DiagramEvent) => {
		const name = e.name
		console.log(name)
		// switch (name) {
		// 	case 'ChangedSelection': {
		// 		const sel = e.subject.first()
		// 		if (sel) {
		// 			this.setState({ selectedKey: sel.key })
		// 		} else {
		// 			this.setState({ selectedKey: null })
		// 		}
		// 		break
		// 	}
		// 	default:
		// 		break
		// }
	}, [])

	/**
	 * Handle GoJS model changes, which output an object of data changes via Model.toIncrementalData.
	 * This method should iterates over those changes and update state to keep in sync with the GoJS model.
	 * This can be done via setState in React or another preferred state management method.
	 * @param obj a JSON-formatted string
	 */
	const handleModelChange = useCallback((obj: go.IncrementalData) => {
		// const insertedNodeKeys = obj.insertedNodeKeys
		// const modifiedNodeData = obj.modifiedNodeData
		// const removedNodeKeys = obj.removedNodeKeys
		// const insertedLinkKeys = obj.insertedLinkKeys
		// const modifiedLinkData = obj.modifiedLinkData
		// const removedLinkKeys = obj.removedLinkKeys
		// const modifiedModelData = obj.modelData

		console.log('Model changed', obj)

		// see gojs-react-basic for an example model change handler
		// when setting state, be sure to set skipsDiagramUpdate: true since GoJS already has this update
	}, [])

	// /**
	//  * Handle changes to the checkbox on whether to allow relinking.
	//  * @param e a change event from the checkbox
	//  */
	// const handleRelinkChange = (e: go.DiagramEvent) => {
	// 	const target = e.target
	// 	const value = target.checked
	// 	this.setState({ modelData: { canRelink: value }, skipsDiagramUpdate: false })
	// }

	return (
		<>
			<PersonInfoDrawer
				person={selectedPerson}
				allAddresses={addresses}
				allPets={pets}
				onClose={onPersonClosed}
				onEdit={setEditingPerson}
			/>
			<EditPersonInfoDrawer
				person={editingPerson}
				allAddresses={addresses}
				allPets={pets}
				onClose={onEditPersonClosed}
			/>
			<DiagramWrapper
				family={family}
				skipsDiagramUpdate={false}
				divId={divId}
				onDiagramEvent={handleDiagramEvent}
				onModelChange={handleModelChange}
				onPersonClicked={onPersonClicked}
				onPersonEdit={setEditingPerson}
			/>
			<div id={divId} style={{ height: 0, width: 0 }} />
		</>
	)
}

const divId = 'myDiagramDiv'
