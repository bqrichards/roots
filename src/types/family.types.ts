export interface Pet {
	/** Unique ID */
	key: number

	/** Animal name (e.g. Buster) */
	name?: string

	/** Animal type (e.g. Cat) */
	animal?: string

	/** Animal breed (e.g. German Shepard) */
	breed?: string

	/** Animal's sex (e.g. M/F) */
	sex?: string
}

export interface Address {
	key: number
	line1?: string
	line2?: string
	city?: string
	zip?: string

	/** State Abbreviation (e.g. IA) */
	state?: string

	country?: string
}

export interface Job {
	/** Address of job */
	place?: Address

	/** Company name */
	company?: string

	/** Position name */
	position?: string

	/** Start year */
	startYear?: string

	/** End year */
	endYear?: string
}

export interface PersonNode {
	/** Unique ID */
	key: number

	/** name */
	name: string

	/** middle name */
	middleName?: string

	/** gender */
	gender: string

	birth?: {
		/**
		 * ISO 8601 UTC
		 * @example
		 * ```js
		 * '2001-10-05T04:01-06:00'
		 * ```
		 * */
		datetime?: string
		place?: string
		weight?: string
		address?: string
		doctor?: string
	}

	death?: {
		/**
		 * ISO 8601 UTC
		 * @example
		 * ```js
		 * '2001-10-05T04:01-06:00'
		 * ```
		 * */
		datetime?: string
		place?: string
	}

	/** Array of jobs */
	jobs?: Job[]

	/** Keys of `Address` */
	addresses?: number[]

	/** Keys of `Pet` */
	pets?: number[]

	/** Additional notes */
	notes?: string
}

export interface Marriage {
	/** Key of person in marriage */
	one: number

	/** Key of other person in marriage */
	two: number

	/** Children keys */
	children: number[]
}

export interface Family {
	name: string
	marriages: Marriage[]
	people: PersonNode[]
	pets?: Pet[]
	addresses?: Address[]
}

export type OnPersonClickedFunction = (person: PersonNode) => void

type PersonNodeBirth = Omit<Required<PersonNode>['birth'], 'datetime'>

interface PersonNodeBirthEditing extends PersonNodeBirth {
	datetime: moment.Moment
}

export interface PersonNodeEditing extends Omit<PersonNode, 'birth'> {
	birth: PersonNodeBirthEditing
}
