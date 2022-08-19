import { FC, useCallback, useEffect, useMemo } from 'react'
import { Button, Collapse, DatePicker, Drawer, Form, Input, Radio, Typography } from 'antd'
import type { Address, PersonNode, PersonNodeEditing, Pet } from '../types/family.types'
import { SaveOutlined } from '@ant-design/icons'
import { PersonUtil } from 'utils/PersonUtil'

type FormValues = PersonNodeEditing

interface EditPersonInfoDrawerProps {
	person: PersonNode | null
	allAddresses: Address[]
	allPets: Pet[]
	onClose: () => void
}

export const EditPersonInfoDrawer: FC<EditPersonInfoDrawerProps> = ({ person, allAddresses, onClose }) => {
	const [form] = Form.useForm<FormValues>()

	useEffect(() => {
		// Convert datetime to moment
		const editingPerson = PersonUtil.convertPersonToEdit(person)
		form.setFieldsValue(editingPerson)
	}, [person])

	const fullName = useMemo(() => {
		if (person?.middleName) {
			const nameParts = person.name.split(' ')
			nameParts.splice(1, 0, person.middleName)
			return nameParts.join(' ')
		} else {
			return person?.name || '(unknown)'
		}
	}, [person])

	const addressOptions = useMemo(
		() =>
			allAddresses.map(address => ({
				value: address.key,
				label: PersonUtil.formatAddress(address),
			})),
		[]
	)

	console.log(addressOptions)

	const onSave = useCallback((values: FormValues) => {
		alert(JSON.stringify(values, undefined, 2))
	}, [])

	return (
		<Drawer
			visible={!!person}
			title={fullName}
			onClose={onClose}
			closable
			destroyOnClose
			extra={
				<Button icon={<SaveOutlined />} onClick={form.submit}>
					Save
				</Button>
			}
		>
			<Form<FormValues> form={form} onFinish={onSave}>
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
				<Collapse defaultActiveKey={['1', '2']}>
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
				<Typography.Text>TODO - jobs</Typography.Text>
				<Typography.Text>TODO - addresses</Typography.Text>
				<Typography.Text>TODO - pets</Typography.Text>
				<Typography.Text>Notes</Typography.Text>
				<Form.Item name="notes">
					<Input.TextArea />
				</Form.Item>
			</Form>
		</Drawer>
	)
}

// {person?.birth && (
// 	<>
// 		<Typography.Title level={5}>Birth</Typography.Title>
// 		<Descriptions column={1}>
// 			<Descriptions.Item label="Date">{birthDate}</Descriptions.Item>
// 			{person?.birth?.place && <Descriptions.Item label="Place">{person.birth.place}</Descriptions.Item>}
// 			{person?.birth?.weight && <Descriptions.Item label="Weight">{person.birth.weight}</Descriptions.Item>}
// 			{person?.birth?.address && <Descriptions.Item label="Address">{person.birth.address}</Descriptions.Item>}
// 			{person?.birth?.doctor && <Descriptions.Item label="Doctor">{person.birth.doctor}</Descriptions.Item>}
// 		</Descriptions>
// 	</>
// )}
// {person?.death && (
// 	<>
// 		<Divider />
// 		<Typography.Title level={5}>Death</Typography.Title>
// 		<Descriptions column={1}>
// 			<Descriptions.Item label="Date">{deathDate}</Descriptions.Item>
// 			{person?.death?.place && <Descriptions.Item label="Place">{person.death.place}</Descriptions.Item>}
// 		</Descriptions>
// 	</>
// )}
// {person?.pets && <ListItemList title="Pets" dataSource={formattedPets} />}
// {person?.addresses && <ListItemList title="Addresses" dataSource={formattedAddresses} />}
// {person?.jobs && <ListItemList title="Jobs" dataSource={formattedJobs} />}
