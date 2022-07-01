import { Descriptions, Divider, Drawer, List, Typography } from 'antd'
import moment, { Moment } from 'moment'
import { FC, useMemo } from 'react'
import type { Address, PersonNode, Pet } from '../types/family.types'

interface PersonInfoDrawerProps {
	person: PersonNode | null
	allAddresses: Address[]
	allPets: Pet[]
	onClose: () => void
}

interface ListItem {
	title: string
	subtitle: string
}

export const PersonInfoDrawer: FC<PersonInfoDrawerProps> = ({ person, allAddresses, allPets, onClose }) => {
	const fullName = useMemo(() => {
		if (person?.middleName) {
			const nameParts = person.n.split(' ')
			nameParts.splice(1, 0, person.middleName)
			return nameParts.join(' ')
		} else {
			return person?.n || '(unknown)'
		}
	}, [person])

	const birthMoment = useMemo(() => {
		if (!person?.birth?.datetime) return null
		return moment(person.birth.datetime)
	}, [person])

	const birthDate = useMemo(() => (birthMoment ? birthMoment.format('MM/DD/YYYY') : ''), [birthMoment])

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

	return (
		<Drawer visible={!!person} title={fullName} onClose={onClose} closable destroyOnClose>
			<Typography.Paragraph>Age: {age}</Typography.Paragraph>
			{person?.birth && (
				<>
					<Typography.Title level={5}>Birth</Typography.Title>
					<Descriptions column={1}>
						<Descriptions.Item label="Date">{birthDate}</Descriptions.Item>
						<Descriptions.Item label="Place">{person?.birth?.place || 'N/A'}</Descriptions.Item>
						<Descriptions.Item label="Weight">{person?.birth?.weight || 'N/A'}</Descriptions.Item>
						<Descriptions.Item label="Address">{person?.birth?.address || 'N/A'}</Descriptions.Item>
						<Descriptions.Item label="Doctor">{person?.birth?.doctor || 'N/A'}</Descriptions.Item>
					</Descriptions>
				</>
			)}
			{person?.death && (
				<>
					<Divider />
					<Typography.Title level={5}>Death</Typography.Title>
					<Descriptions column={1}>
						<Descriptions.Item label="Date">{deathDate}</Descriptions.Item>
						<Descriptions.Item label="Place">{person?.death?.place || 'N/A'}</Descriptions.Item>
					</Descriptions>
				</>
			)}
			{person?.pets && (
				<>
					<Divider />
					<Typography.Title level={5}>Pets</Typography.Title>
					<List
						dataSource={formattedPets}
						renderItem={pet => (
							<List.Item>
								<List.Item.Meta title={pet.title} description={pet.subtitle} />
							</List.Item>
						)}
					/>
				</>
			)}
			{person?.addresses && (
				<>
					<Divider />
					<Typography.Title level={5}>Addresses</Typography.Title>
					<List
						dataSource={formattedAddresses}
						renderItem={address => (
							<List.Item>
								<List.Item.Meta title={address.title} description={address.subtitle} />
							</List.Item>
						)}
					/>
				</>
			)}
			{person?.jobs && (
				<>
					<Divider />
					<Typography.Title level={5}>Jobs</Typography.Title>
					<List
						dataSource={person?.jobs || []}
						renderItem={job => (
							<List.Item>
								<List.Item.Meta title={job.company} description={`${job.startYear} - ${job.endYear}`} />
							</List.Item>
						)}
					/>
				</>
			)}
		</Drawer>
	)
}
