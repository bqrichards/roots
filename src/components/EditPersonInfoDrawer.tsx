import { FC, useCallback, useEffect, useMemo, useState } from 'react'
import { Button, Collapse, DatePicker, Drawer, Form, Input, Radio, Table, TableColumnsType, Typography } from 'antd'
import type { Address, PersonNode, Pet } from '../types/family.types'
import { SaveOutlined } from '@ant-design/icons'
import { PersonUtil } from 'utils/PersonUtil'
import type { TablePaginationConfig, TableRowSelection } from 'antd/lib/table/interface'

interface EditPersonInfoDrawerProps {
	person: PersonNode | null
	allAddresses: Address[]
	allPets: Pet[]
	onClose: () => void
}

export const EditPersonInfoDrawer: FC<EditPersonInfoDrawerProps> = ({ person, allAddresses, onClose }) => {
	const [form] = Form.useForm()
	const [, setRerender] = useState(false)
	const rerender = useCallback(() => setRerender(prev => !prev), [])
	const selectedAddresses = form.getFieldValue('addresses')

	const visible = !!person

	useEffect(() => {
		if (!visible) {
			form.resetFields()
		}
	}, [form, visible])

	useEffect(() => {
		// Convert datetime to moment
		const editingPerson = PersonUtil.convertPersonToEdit(person)
		form.setFieldsValue(editingPerson)
		rerender()
	}, [form, person])

	const fullName = useMemo(() => {
		let name = ''
		if (person?.middleName) {
			const nameParts = person.name.split(' ')
			nameParts.splice(1, 0, person.middleName)
			name = nameParts.join(' ')
		} else {
			name = person?.name || '(unknown)'
		}

		return `Editing ${name}`
	}, [person])

	const onSave = useCallback((values: PersonNode) => {
		// TODO
		alert(JSON.stringify(values, undefined, 2))
	}, [])

	const addressSelection = useMemo<TableRowSelection<Address>>(
		() => ({
			selectedRowKeys: selectedAddresses,
			onChange: newSelectedRows => {
				form.setFieldsValue({
					addresses: newSelectedRows,
				})
				rerender()
			},
		}),
		[form, selectedAddresses, rerender]
	)

	return (
		<Drawer
			visible={visible}
			title={fullName}
			onClose={onClose}
			closable
			destroyOnClose
			width={600}
			extra={
				<Button icon={<SaveOutlined />} onClick={form.submit}>
					Save
				</Button>
			}
		>
			<Form form={form} onFinish={onSave}>
				<Form.Item name="key" hidden />
				<Typography.Text>First Name</Typography.Text>
				<Form.Item name="name">
					<Input />
				</Form.Item>
				<Typography.Text>Middle Name</Typography.Text>
				<Form.Item name="middleName">
					<Input />
				</Form.Item>
				<Typography.Text>Sex</Typography.Text>
				<Form.Item name="gender">
					<Radio.Group>
						<Radio value="M">Male</Radio>
						<Radio value="F">Female</Radio>
					</Radio.Group>
				</Form.Item>
				<Collapse defaultActiveKey={['1']} style={{ marginBottom: 16 }}>
					<Collapse.Panel key="1" header="Birth">
						<Typography.Text>Date</Typography.Text>
						<Form.Item name={['birth', 'datetime']}>
							<DatePicker showTime use12Hours format="MM/DD/YYYY hh:mm a" />
						</Form.Item>
						<Typography.Text>Place</Typography.Text>
						<Form.Item name={['birth', 'place']}>
							<Input />
						</Form.Item>
						<Typography.Text>Weight</Typography.Text>
						<Form.Item name={['birth', 'weight']}>
							<Input />
						</Form.Item>
						<Typography.Text>Address</Typography.Text>
						<Form.Item name={['birth', 'address']}>
							<Input />
						</Form.Item>
						<Typography.Text>Doctor</Typography.Text>
						<Form.Item name={['birth', 'doctor']}>
							<Input />
						</Form.Item>
					</Collapse.Panel>
					<Collapse.Panel key="2" header="Death">
						<Typography.Text>Date</Typography.Text>
						<Form.Item name={['death', 'datetime']}>
							<DatePicker showTime use12Hours format="MM/DD/YYYY hh:mm a" />
						</Form.Item>
						<Typography.Text>Place</Typography.Text>
						<Form.Item name={['death', 'place']}>
							<Input />
						</Form.Item>
					</Collapse.Panel>
				</Collapse>
				<Form.Item name="jobs" hidden />
				<Typography.Text>Addresses</Typography.Text>
				<Form.Item name="addresses" hidden />
				<Table
					dataSource={allAddresses}
					columns={addressColumns}
					rowSelection={addressSelection}
					pagination={pageTableConfig}
					showHeader={false}
				/>
				<Form.Item name="pets" hidden />
				<Typography.Text>Notes</Typography.Text>
				<Form.Item name="notes">
					<Input.TextArea />
				</Form.Item>
			</Form>
		</Drawer>
	)
}

const addressColumns: TableColumnsType<Address> = [
	{
		title: 'Address',
		render: (_value, record) => PersonUtil.formatAddress(record),
	},
]

const pageTableConfig: TablePaginationConfig = {
	pageSize: 5,
}
