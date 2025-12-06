// ============= BASIC GEOMETRY TYPES =============

export interface Point {
    x: number
    y: number
}

export interface Circle extends Point {
    radius: number
}

// ============= INTERSECTION TYPES =============

export interface IntersectionPoint extends Point {
    parentIndex: number[]
    angle?: number
}

export interface VennArc {
    circle: Circle
    width: number
    p1: Point
    p2: Point
}

export interface VennStats {
    area: number
    arcArea: number
    polygonArea: number
    arcs: VennArc[]
    innerPoints: IntersectionPoint[]
    intersectionPoints: IntersectionPoint[]
}

// ============= SET TYPES =============

export interface VennSet {
    sets: string[]
    size: number
    label?: string
    weight?: number
}

/** Base info for a set with size */
export interface BaseSetInfo {
    set: string
    size: number
}

/** Set info with additional weight property for overlap calculations */
export interface WeightedSetInfo extends BaseSetInfo {
    weight: number
}

// ============= CIRCLE VARIANTS =============

export interface CircleWithSetId extends Circle {
    setid?: string
    size?: number
    rowid?: number
}

/** Circle with additional metadata used in greedy layout algorithm */
export interface CircleWithMetadata extends Circle {
    rowid: number
    size: number
}

// ============= LAYOUT TYPES =============

export type Solution = Record<string, Circle>

/** Comparator function for ordering circles during orientation */
export type CircleComparator = ((a: CircleWithSetId, b: CircleWithSetId) => number) | null

/** Optimization history entry from fmin library */
export interface OptimizationHistory {
    x: number[]
    fx: number
}

export interface LayoutParameters {
    maxIterations?: number
    restarts?: number
    initialLayout?: (areas: VennSet[], parameters: LayoutParameters) => Solution
    lossFunction?: (sets: Solution, overlaps: VennSet[]) => number
    history?: OptimizationHistory[]
}

export interface DistanceMatrices {
    distances: number[][]
    constraints: number[][]
}

// ============= BOUNDING & CLUSTER TYPES =============

export interface BoundingBox {
    xRange: { max: number, min: number }
    yRange: { max: number, min: number }
}

/** A cluster of disjoint circles with computed bounds */
export interface DisjointCluster {
    circles: CircleWithSetId[]
    size?: number
    bounds?: BoundingBox
}
