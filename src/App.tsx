import { useCallback, useEffect, useState } from 'react'
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { CHART_PATH, HOME_PATH } from './routes'
import { Menu, Layout, Typography } from 'antd'
import type { MenuClickEventHandler } from 'rc-menu/lib/interface'
import { HomeOutlined, NodeExpandOutlined } from '@ant-design/icons'

import styles from './styles/App.module.scss'

import Home from './routes/home'
import Chart from './routes/chart'
import { FamilySelect } from './components/FamilySelect'
import type { Family } from './types/family.types'
import INITIAL_FAMILY from './initialFamily'

const { Sider, Content } = Layout

const MENU_ITEMS = [
	{ label: 'Home', key: HOME_PATH, icon: <HomeOutlined /> },
	{ label: 'Chart', key: CHART_PATH, icon: <NodeExpandOutlined /> },
]

/** Key: path, Value: display name */
const menuKeyToLabel: Record<string, string> = MENU_ITEMS.reduce((map, obj) => {
	map[obj.key] = obj.label
	return map
}, {})

const App = () => {
	const [familyTree, setFamilyTree] = useState<Family | null>(INITIAL_FAMILY)
	const [collapsed, setCollapsed] = useState(true)
	const toggleCollapsed = useCallback(() => setCollapsed(prev => !prev), [])

	const makeNewFamilyTree = useCallback(() => setFamilyTree(INITIAL_FAMILY), [])

	const navigate = useNavigate()

	const { pathname } = useLocation()

	// useEffect(() => {
	// 	makeNewFamilyTree()
	// }, [])

	const onMenuClickHandler = useCallback<MenuClickEventHandler>(({ key }) => {
		navigate(key)
	}, [])

	useEffect(() => {
		if (pathname in menuKeyToLabel) {
			document.title = `${menuKeyToLabel[pathname]} | roots`
		} else {
			document.title = 'roots'
		}
	}, [pathname])

	// Setup hotkey for collapsing Sider
	useEffect(() => {
		const listener = e => {
			if (e.key === '[') {
				toggleCollapsed()
			} else if (e.key === '1') {
				navigate(HOME_PATH)
			} else if (e.key === '2') {
				navigate(CHART_PATH)
			}
		}

		document.addEventListener('keypress', listener)

		return () => {
			document.removeEventListener('keypress', listener)
		}
	}, [])

	return (
		<div className={styles.container}>
			<Sider className={styles.sider} collapsible collapsed={collapsed} onCollapse={setCollapsed}>
				<div className={styles.siderMenuContainer}>
					<Menu
						mode="inline"
						className={styles.siderMenu}
						items={MENU_ITEMS}
						selectedKeys={[pathname]}
						onClick={onMenuClickHandler}
					/>
					<div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
						<Typography.Text>roots{collapsed ? '' : ' v0.0.1'}</Typography.Text>
					</div>
				</div>
			</Sider>
			<Content className={styles.mainContent}>
				<Routes>
					<Route path={HOME_PATH} element={<Home />} />
					<Route path={CHART_PATH} element={<Chart family={familyTree} />} />
				</Routes>
				<FamilySelect visible={familyTree === null} makeNew={makeNewFamilyTree} />
			</Content>
		</div>
	)
}

export default App
