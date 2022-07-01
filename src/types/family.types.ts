export interface Pet {
	/** Unique ID */
	key: number

	/** Animal name (e.g. Buster) */
	name?: string

	/** Animal type (e.g. Cat) */
	animal?: string

	/** Animal breed (e.g. German Shepard) */
	breed?: string

	/** UTC */
	birthDateTime?: string

	/** UTC */
	deathDateTime?: string
}

export interface Address {
	key: number
	line1?: string
	line2?: string
	city?: string

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
	n: string

	/** sex */
	s: string

	birth?: {
		/** UTC */
		datetime?: string
		place?: string
		weight?: string
		address?: string
		doctor?: string
	}

	death?: {
		/** UTC */
		datetime?: string
		place?: string
	}

	jobs?: Job[]

	/** Keys of `Address` */
	addresses?: number[]

	/** Keys of `Pet` */
	pets?: number[]

	/** mother */
	m?: number

	/** father */
	f?: number

	/** wife */
	wife?: number

	/** husband */
	husband?: number
}

export interface Family {
	name: string
	people: PersonNode[]
}
