import moment from 'moment'
import type { Address, PersonNode, PersonNodeEditing } from 'types/family.types'

export class PersonUtil {
	public static convertPersonToEdit(person?: PersonNode): PersonNodeEditing | undefined {
		if (!person) return undefined

		let datetime: moment.Moment | null = null
		if ((person?.birth?.datetime?.length || 0) > 0) {
			const birthMoment = moment(person.birth.datetime)
			if (birthMoment.isValid()) {
				datetime = birthMoment
			}
		}

		return {
			...person,
			birth: {
				...person.birth,
				datetime,
			},
		}
	}

	public static formatAddress(address: Address): string {
		let str = ''
		if (address.line1) {
			str += `${address.line1}`
		}

		if (address.line2) {
			str += ` ${address.line2}`
		}

		if (address.city) {
			str += ` ${address.city}`
			if (address.state || address.zip || address.country) {
				str += ','
			}
		}

		if (address.state) {
			str += ` ${address.state}`
		}

		if (address.zip) {
			str += ` ${address.zip}`
		}

		if (address.country) {
			str += ` ${address.country}`
		}

		return str
	}
}
