import { describe, expect, test } from 'vitest'
import * as venn from '../src/index'

const SMALL = 1e-5

function nearlyEqual(left: number, right: number, tolerance = SMALL, message = 'nearlyEqual') {
    expect(Math.abs(left - right)).toBeLessThan(tolerance)
}

function lessThan(left: number, right: number, message = 'lessThan') {
    expect(left).toBeLessThan(right)
}

describe('greedyLayout', () => {
    test('should layout areas with zero loss', () => {
        const areas = [
            { sets: ['0'], size: 0.7746543297103429 },
            { sets: ['1'], size: 0.1311252856844238 },
            { sets: ['2'], size: 0.2659942131443344 },
            { sets: ['3'], size: 0.44600866168641723 },
            { sets: ['0', '1'], size: 0.02051532092950205 },
            { sets: ['0', '2'], size: 0 },
            { sets: ['0', '3'], size: 0 },
            { sets: ['1', '2'], size: 0 },
            { sets: ['1', '3'], size: 0.07597023820511245 },
            { sets: ['2', '3'], size: 0 },
        ]

        const circles = venn.greedyLayout(areas)
        const loss = venn.lossFunction(circles, areas)
        nearlyEqual(loss, 0)
    })

    test('should layout areas with complex overlaps', () => {
        const areas = [
            { sets: ['0'], size: 0.5299368855059736 },
            { sets: ['1'], size: 0.03364187025606481 },
            { sets: ['2'], size: 0.3121450394871512 },
            { sets: ['3'], size: 0.0514397361783036 },
            { sets: ['0', '1'], size: 0.013912447645582351 },
            { sets: ['0', '2'], size: 0.005903647141469598 },
            { sets: ['0', '3'], size: 0.0514397361783036 },
            { sets: ['1', '2'], size: 0.012138157839477597 },
            { sets: ['1', '3'], size: 0.008010688232481479 },
            { sets: ['2', '3'], size: 0 },
        ]

        const circles = venn.greedyLayout(areas)
        const loss = venn.lossFunction(circles, areas)
        nearlyEqual(loss, 0)
    })

    test('should handle small circle completely overlapped', () => {
        // one small circle completely overlapped in the intersection
        // area of two larger circles
        const areas = [
            { sets: ['0'], size: 1.7288584050841396 },
            { sets: ['1'], size: 0.040875831658950056 },
            { sets: ['2'], size: 2.587146019782323 },
            { sets: ['0', '1'], size: 0.040875831658950056 },
            { sets: ['0', '2'], size: 0.5114617575187569 },
            { sets: ['1', '2'], size: 0.040875831658950056 },
        ]

        const circles = venn.greedyLayout(areas)
        const loss = venn.lossFunction(circles, areas)
        nearlyEqual(loss, 0)
    })
})

describe('circleArea', () => {
    test('should calculate empty circle', () => {
        nearlyEqual(venn.circleArea(10, 0), 0, SMALL, 'empty circle test')
    })

    test('should calculate half circle', () => {
        nearlyEqual(venn.circleArea(10, 10), (Math.PI * 10 * 10) / 2, SMALL, 'half circle test')
    })

    test('should calculate full circle', () => {
        nearlyEqual(venn.circleArea(10, 20), Math.PI * 10 * 10, SMALL, 'full circle test')
    })
})

describe('circleOverlap', () => {
    test('should calculate nonoverlapping circles', () => {
        nearlyEqual(venn.circleOverlap(10, 10, 200), 0, SMALL, 'nonoverlapping circles test')
    })

    test('should calculate full overlapping circles', () => {
        nearlyEqual(venn.circleOverlap(10, 10, 0), Math.PI * 10 * 10, SMALL, 'full overlapping circles test')
    })

    test('should calculate partial overlap', () => {
        nearlyEqual(venn.circleOverlap(10, 5, 5), Math.PI * 5 * 5, SMALL)
    })
})

describe('distanceFromIntersectArea', () => {
    function testDistanceFromIntersectArea(r1: number, r2: number, overlap: number) {
        const distance = venn.distanceFromIntersectArea(r1, r2, overlap)
        nearlyEqual(venn.circleOverlap(r1, r2, distance), overlap, 1e-2)
    }

    test('should calculate distance for various overlaps', () => {
        testDistanceFromIntersectArea(1.9544100476116797, 2.256758334191025, 11)
        testDistanceFromIntersectArea(111.06512962798197, 113.32348546565727, 1218)
        testDistanceFromIntersectArea(44.456564007075, 149.4335753619362, 2799)
        testDistanceFromIntersectArea(592.89, 134.75, 56995)
        testDistanceFromIntersectArea(139.50778247443944, 32.892784970851956, 3399)
        testDistanceFromIntersectArea(4.886025119029199, 5.077706251929807, 75)
    })
})

describe('circleCircleIntersection', () => {
    const testIntersection = (
        p1: { x: number, y: number, radius: number },
        p2: { x: number, y: number, radius: number },
        msg: string,
    ) => {
        const points = venn.circleCircleIntersection(p1, p2)
        // make sure that points are appropriately spaced
        for (let i = 0; i < points.length; i++) {
            const point = points[i]
            nearlyEqual(
                venn.distance(point, p1),
                p1.radius,
                SMALL,
                `${msg}: test distance to p1 for point ${i}`,
            )
            nearlyEqual(
                venn.distance(point, p2),
                p2.radius,
                SMALL,
                `${msg}: test distance to p2 for point ${i}`,
            )
        }
        return points
    }

    test('should handle fully contained circles', () => {
        const points = venn.circleCircleIntersection(
            { x: 0, y: 3, radius: 10 },
            { x: 3, y: 0, radius: 20 },
        )
        expect(points.length).toBe(0)
    })

    test('should handle fully disjoint circles', () => {
        const points = venn.circleCircleIntersection(
            { x: 0, y: 0, radius: 10 },
            { x: 21, y: 0, radius: 10 },
        )
        expect(points.length).toBe(0)
    })

    test('should calculate midway intersection', () => {
        const points = testIntersection(
            { x: 0, y: 0, radius: 10 },
            { x: 10, y: 0, radius: 10 },
            'test midway intersection',
        )
        expect(points.length).toBe(2)
        nearlyEqual(points[0].x, 5)
        nearlyEqual(points[1].x, 5)
        nearlyEqual(points[0].y, -1 * points[1].y)
    })

    test('should handle failing case from input', () => {
        const points = testIntersection(
            { radius: 10, x: 15, y: 5 },
            { radius: 10, x: 20, y: 0 },
            'test intersection2',
        )
        expect(points.length).toBe(2)
    })
})

describe('disjointCircles', () => {
    test('should calculate overlapping circles with zero total overlap', () => {
        // each one of these circles overlaps all the others, but the total overlap is still 0
        const circles = [
            { x: 0.909, y: 0.905, radius: 0.548 },
            { x: 0.765, y: 0.382, radius: 0.703 },
            { x: 0.63, y: 0.019, radius: 0.449 },
            { x: 0.21, y: 0.755, radius: 0.656 },
            { x: 0.276, y: 0.723, radius: 1.145 },
            { x: 0.141, y: 0.585, radius: 0.419 },
        ]

        const area = venn.intersectionArea(circles)
        expect(area).toBe(0)
    })

    test('should handle smallest circle completely overlapped', () => {
        // no intersection points, but the smallest circle is completely overlapped by each of the others
        const circles = [
            { x: 0.426, y: 0.882, radius: 0.944 },
            { x: 0.24, y: 0.685, radius: 0.992 },
            { x: 0.01, y: 0.909, radius: 1.161 },
            { x: 0.54, y: 0.475, radius: 0.41 },
        ]

        const expectedArea = circles[3].radius * circles[3].radius * Math.PI
        expect(venn.intersectionArea(circles)).toBe(expectedArea)
    })
})

describe('randomFailures', () => {
    test('should handle random failure case 1', () => {
        const circles = [
            { x: 0.501, y: 0.32, radius: 0.629 },
            { x: 0.945, y: 0.022, radius: 1.015 },
            { x: 0.021, y: 0.863, radius: 0.261 },
            { x: 0.528, y: 0.09, radius: 0.676 },
        ]
        const area = venn.intersectionArea(circles)

        expect(Math.abs(area - 0.0008914)).toBeLessThan(0.0001)
    })

    test('should handle random failure case 2', () => {
        const circles = [
            { x: 9.154829758385864, y: 0, size: 226, radius: 8.481629223064205 },
            { x: 5.806079662851866, y: 7.4438023223126795, size: 733, radius: 15.274853405932202 },
            { x: 9.484491297623553, y: 4.064806303558571, size: 332, radius: 10.280023453913834 },
            { x: 10.56492833796709, y: 3.0723147554880175, size: 244, radius: 8.812923024107548 },
        ]

        const area = venn.intersectionArea(circles)
        nearlyEqual(area, 10.96362)
    })

    test('should not return NaN for valid intersections', () => {
        const circles = [
            { x: -0.0014183481763938425, y: 0.0006071174738860746, radius: 510.3115834996166 },
            { x: 875.0163281608848, y: 0.0007003612396158774, radius: 465.1793581792228 },
            { x: 462.7394999567192, y: 387.9359963330729, radius: 172.62633992134658 },
        ]
        const area = venn.intersectionArea(circles)
        expect(Number.isNaN(area)).toBe(false)
    })
})

describe('computeTextCentre', () => {
    test('should compute center for single circle', () => {
        const center = venn.computeTextCentre([{ x: 0, y: 0, radius: 1 }], [])
        nearlyEqual(center.x, 0)
        nearlyEqual(center.y, 0)
    })

    test('should compute center for two circles', () => {
        const center = venn.computeTextCentre([{ x: 0, y: 0, radius: 1 }], [{ x: 0, y: 1, radius: 1 }])
        nearlyEqual(center.x, 0, 1e-4)
        nearlyEqual(center.y, -0.5)
    })
})

describe('normalizeSolution', () => {
    test('should place far apart circles closer together', () => {
        // test two circles that are far apart
        const solution = {
            0: { x: 0, y: 0, radius: 0.5 },
            1: { x: 1e10, y: 0, radius: 1.5 },
        }

        // should be placed close together
        const normalized = venn.normalizeSolution(solution)
        // distance should be 2, but we space things out
        lessThan(venn.distance(normalized['0'], normalized['1']), 2.1)
    })
})

describe('disjointClusters', () => {
    test('should identify single cluster', () => {
        const input = [
            {
                x: 0.8047033110633492,
                y: 0.9396705999970436,
                radius: 0.47156485118903224,
            },
            {
                x: 0.7961132447235286,
                y: 0.014027722179889679,
                radius: 0.14554832570720466,
            },
            {
                x: 0.28841276094317436,
                y: 0.98081015329808,
                radius: 0.9851036085514352,
            },
            {
                x: 0.7689983483869582,
                y: 0.2899463507346809,
                radius: 0.7210563338827342,
            },
        ]

        const clusters = venn.disjointCluster(input)
        expect(clusters.length).toBe(1)
    })
})
