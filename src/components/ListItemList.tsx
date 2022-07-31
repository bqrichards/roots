import { FC } from 'react'
import { Divider, List, Typography } from 'antd'

export interface ListItem {
	title: string
	subtitle: string
}

interface ListItemListProps {
	title: string
	dataSource: ListItem[]
}

export const ListItemList: FC<ListItemListProps> = ({ title, dataSource }) => (
	<>
		<Divider />
		<Typography.Title level={5}>{title}</Typography.Title>
		<List
			dataSource={dataSource}
			renderItem={item => (
				<List.Item>
					<List.Item.Meta title={item.title} description={item.subtitle} />
				</List.Item>
			)}
		/>
	</>
)
