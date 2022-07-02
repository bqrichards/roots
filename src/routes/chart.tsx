import { PageHeader } from 'components/PageHeader'
import { init } from '../utils/ChartHelper'
import { useCallback, useEffect, useState } from 'react'
import '../styles/chart.scss'
import type { Family, PersonNode } from '../types/family.types'
import { PersonInfoDrawer } from '../components/PersonInfoDrawer'

interface ChartProps {
	family: Family | null
}

export default function Chart({ family }: ChartProps) {
	const { people = [], addresses = [], pets = [] } = family || {}
	const [selectedPerson, setSelectedPerson] = useState<PersonNode | null>()

	const onPersonClicked = useCallback((person: PersonNode) => {
		setSelectedPerson(person)
	}, [])

	const onPersonClosed = useCallback(() => {
		setSelectedPerson(null)
	}, [])

	useEffect(() => {
		console.log('Init', people)
		init(people, onPersonClicked)
	}, [people])

	return (
		<>
			<PageHeader title="Chart" />
			<PersonInfoDrawer person={selectedPerson} allAddresses={addresses} allPets={pets} onClose={onPersonClosed} />
			<div id="myDiagramDiv">
				<canvas id="canvas" tabIndex={0} width="2108" height="1196">
					This text is displayed if your browser does not support the Canvas HTML element.
				</canvas>
			</div>
		</>
	)
}
