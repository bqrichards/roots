export interface Job {
	place: string
	startYear: string
	endYear: string
}

export interface PersonNode {
	/** Unique ID */
	key: number

	/** name */
	n: string

	/** sex */
	s: string

	birth?: {
		/** MM/DD/YYYY */
		date?: string
		/** HH:mm */
		time?: string
		place?: string
		weight?: string
		address?: string
		doctor?: string
	}

	death?: {
		date?: string
		time?: string
		place?: string
	}

	jobs?: Job[]

	/** mother */
	m?: number

	/** father */
	f?: number

	/** wife */
	wife?: number

	/** husband */
	husband?: number

	origin?: string

	/** attributes/markers */
	a?: string[]
}

export interface Family {
	name: string
	people: PersonNode[]
}
