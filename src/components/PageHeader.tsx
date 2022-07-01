import { FC } from 'react'
import { Typography } from 'antd'
import styles from '../styles/PageHeader.module.scss'

interface PageHeaderProps {
	title: string
}

export const PageHeader: FC<PageHeaderProps> = ({ title }) => (
	<div className={styles.titleContainer}>
		<Typography.Title>{title}</Typography.Title>
	</div>
)
