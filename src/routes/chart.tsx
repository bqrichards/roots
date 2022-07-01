import { PageHeader } from 'components/PageHeader'
import { init } from '../utils/ChartHelper'
import { useEffect } from 'react'
import '../styles/chart.scss'
import type { Family } from '../types/family.types'

interface ChartProps {
	family: Family | null
}

export default function Chart({ family }: ChartProps) {
	const { people = [] } = family || {}

	useEffect(() => {
		console.log('Init', people)
		init(people)
	}, [people])

	return (
		<>
			<PageHeader title="Chart" />
			<div id="myDiagramDiv">
				<canvas id="canvas" tabIndex={0} width="2108" height="1196">
					This text is displayed if your browser does not support the Canvas HTML element.
				</canvas>
			</div>
		</>
	)
}
