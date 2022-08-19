import { useEffect } from 'react'
import { useNavigate } from 'react-router'
import { CHART_PATH } from 'routes'

export default function Home() {
	const navigate = useNavigate()

	useEffect(() => {
		navigate(CHART_PATH)
	}, [])

	return <></>
}
