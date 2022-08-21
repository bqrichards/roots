import { FC, useMemo } from 'react'
import { Button, Descriptions, Divider, Drawer, Typography } from 'antd'
import moment, { Moment } from 'moment'
import type { Address, PersonNode, Pet } from '../types/family.types'
import { ListItemList } from './ListItemList'
import type { ListItem } from './ListItemList'
import { EditOutlined } from '@ant-design/icons'

interface PersonInfoDrawerProps {
	person: PersonNode | null
	allAddresses: Address[]
	allPets: Pet[]
	onEdit: (person: PersonNode | null) => void
	onClose: () => void
}

export const PersonInfoDrawer: FC<PersonInfoDrawerProps> = ({ person, allAddresses, allPets, onClose, onEdit }) => {
	const fullName = useMemo(() => {
		if (person?.middleName) {
			const nameParts = person.name.split(' ')
			nameParts.splice(1, 0, person.middleName)
			return nameParts.join(' ')
		} else {
			return person?.name || '(unknown)'
		}
	}, [person])

	const birthMoment = useMemo(() => {
		if (!person?.birth?.datetime) return null
		return moment(person.birth.datetime)
	}, [person])

	const birthDate = useMemo(() => {
		if (!birthMoment) {
			return ''
		}

		// Format with time
		if (person.birth.datetime.indexOf('T') > -1) {
			return birthMoment.format('MM/DD/YYYY h:mm a')
		}

		return birthMoment.format('MM/DD/YYYY')
	}, [birthMoment, person?.birth?.datetime])

	const deathMoment = useMemo(() => {
		if (!person?.death?.datetime) return null
		return moment(person.death.datetime)
	}, [person])

	const deathDate = useMemo(() => (deathMoment ? deathMoment.format('MM/DD/YYYY') : ''), [deathMoment])

	const age = useMemo(() => {
		if (birthMoment === null) return '(unknown)'

		let endDate: Moment
		if (deathMoment) {
			endDate = deathMoment
		} else {
			endDate = moment()
		}

		const age = endDate.diff(birthMoment, 'years')
		return age
	}, [person, birthMoment, deathMoment])

	const formattedAddresses = useMemo<ListItem[]>(
		() =>
			allAddresses
				.filter(address => (person?.addresses || []).indexOf(address.key) > -1)
				.map(address => {
					const title = [address.line1, address.line2].filter(val => typeof val === 'string').join(' ')
					const cityState = [address.city, address.state].filter(val => typeof val === 'string').join(', ')
					const subtitle = [cityState, address.zip].filter(val => typeof val === 'string').join('. ')

					return { title, subtitle }
				}),
		[person, allAddresses]
	)

	const formattedPets = useMemo<ListItem[]>(
		() =>
			allPets
				.filter(pet => (person?.pets || []).indexOf(pet.key) > -1)
				.map(pet => {
					const title = pet.name
					const subtitle = [pet.animal, pet.breed, pet.sex].filter(val => typeof val === 'string').join(', ')

					return { title, subtitle }
				}),
		[person, allPets]
	)

	const formattedJobs = useMemo<ListItem[]>(
		() =>
			(person?.jobs || []).map(job => ({
				title: job.company,
				subtitle: `${job.startYear || ''} - ${job.endYear || ''}`,
			})),
		[person]
	)

	return (
		<Drawer
			visible={!!person}
			title={fullName}
			onClose={onClose}
			closable
			destroyOnClose
			extra={
				<Button icon={<EditOutlined />} onClick={() => onEdit(person)}>
					Edit
				</Button>
			}
		>
			<Typography.Paragraph>Age: {age}</Typography.Paragraph>
			{person?.birth && (
				<>
					<Typography.Title level={5}>Birth</Typography.Title>
					<Descriptions column={1}>
						<Descriptions.Item label="Date">{birthDate}</Descriptions.Item>
						{person?.birth?.place && <Descriptions.Item label="Place">{person.birth.place}</Descriptions.Item>}
						{person?.birth?.weight && <Descriptions.Item label="Weight">{person.birth.weight}</Descriptions.Item>}
						{person?.birth?.address && <Descriptions.Item label="Address">{person.birth.address}</Descriptions.Item>}
						{person?.birth?.doctor && <Descriptions.Item label="Doctor">{person.birth.doctor}</Descriptions.Item>}
					</Descriptions>
				</>
			)}
			{person?.death && (
				<>
					<Divider />
					<Typography.Title level={5}>Death</Typography.Title>
					<Descriptions column={1}>
						<Descriptions.Item label="Date">{deathDate}</Descriptions.Item>
						{person?.death?.place && <Descriptions.Item label="Place">{person.death.place}</Descriptions.Item>}
					</Descriptions>
				</>
			)}
			{person?.pets && <ListItemList title="Pets" dataSource={formattedPets} />}
			{person?.addresses && <ListItemList title="Addresses" dataSource={formattedAddresses} />}
			{person?.jobs && <ListItemList title="Jobs" dataSource={formattedJobs} />}
			{person?.notes && (
				<>
					<Typography.Title level={5}>Notes</Typography.Title>
					<Typography.Paragraph>{person.notes}</Typography.Paragraph>
				</>
			)}
		</Drawer>
	)
}
