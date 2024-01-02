/**
 * 8 x 8 representation of the geohash coding
 * Used for testing
 */
let quad_t = 
[['010101','010111','011101','011111','110101','110111','111101','111111'],
 ['010100','010110','011100','011110','110100','110110','111100','111110'],
 ['010001','010011','011001','011011','110001','110011','111001','111011'],
 ['010000','010010','011000','011010','110000','110010','111000','111010'],
 ['000101','000111','001101','001111','100101','100111','101101','101111'],
 ['000100','000110','001100','001110','100100','100110','101100','101110'],
 ['000001','000011','001001','001011','100001','100011','101001','101011'],
 ['000000','000010','001000','001010','100000','100010','101000','101010']]

let quad_int = 
[[21, 23, 29, 31, 53, 55, 61, 63],
 [20, 22, 28, 30, 52, 54, 60, 62],
 [17, 19, 25, 27, 49, 51, 57, 59],
 [16, 18, 24, 26, 48, 50, 56, 58],
 [ 5,  7, 13, 15, 37, 39, 45, 47],
 [ 4,  6, 12, 14, 36, 38, 44, 46],
 [ 1,  3,  9, 11, 33, 35, 41, 43],
 [ 0,  2,  8, 10, 32, 34, 40, 42]]

 /**
 * Distance based queries based on the morton curve only works on
 * individual quadrants, which is why it is hard to compare them to farther ones
 * but if we instead split the row and col bits, then it should be fine
 * the reason being row bits of similar row elements are the same, and col too
 * and the offset between the two, surprisingly is just 1
 */

/**
 * Gets all the odd bits from a bit string
 * @param {*} bit 
 * @returns 
 */
function get_odd_bits(bit) {
    let odd = "";
    for (let i = 0; i < bit.length; i += 2) {
        odd += bit[i];
    }
    return parseInt(odd, 2);
}

/**
 * Gets all the even bits from a bit string
 * @param {*} bit 
 * @returns 
 */
function get_even_bits(bit) {
    let even = "";
    for (let i = 1; i < bit.length; i += 2) {
        even += bit[i];
    }
    return parseInt(even, 2);
}

/**
 * Gets the number of cells that the current hash is apart from horizontally
 * @param {*} bit 
 * @param {*} bit_c 
 * @returns an integer value based on their distance [bit][][][bit_c] will return 3
 */
function get_col_offset(bit, bit_c) {
    return Math.abs(get_odd_bits(bit) - get_odd_bits(bit_c))
}

/**
 * Gets the number of cells that the current hash is apart from vertically
 * @param {*} bit 
 * @param {*} bit_c 
 * @returns an integer value based on their distance
 */
function get_row_offset(bit, bit_c) {
    return Math.abs(get_even_bits(bit) - get_even_bits(bit_c))
}

/**
 * Returns the euclidean distance of a certain horizontal offset and vertical offset
 * @param {*} h_off 
 * @param {*} v_off 
 * @returns 
 */
function euclidean_dist(h_off, v_off) {
    return Math.sqrt(Math.pow(h_off, 2) + Math.pow(v_off, 2));
}

/**
 * Returns an estimate of the nearness between two geohashes
 * This should be in linear time O(N)
 * @param {*} a the first bit
 * @param {*} b the second bit
 * @returns 
 */
function get_nearness(a, b) {
    return euclidean_dist(get_col_offset(a,b), get_row_offset(a,b))
}

//ATTEMPT TO SOLVE THE LOCALITY ISSUE

/**
 * Joins the odd and even parts of the bits O(N)
 * @param {*} odds 
 * @param {*} even 
 * @returns 
 */
function join_bit(odds, even) {
    let bit = ""
    for (let i = 0; i < odds.length; i++) {
        bit += odds[i] + even[i]
    }
    return bit
}

/**
 * Gets a list of all the bits that are within an
 * integer range of the given bit
 * @param {*} bit 
 * @param {*} range 
 * @returns 
 */
function get_all_bits(bit, range) {
    let base = parseInt(bit, 2)
    let bits = []
    let lowerBound = int(Math.max(0, base - range))
    let upperBound = int(base + range);
    for (let i = lowerBound; i <= upperBound; i++) {
        if (i.toString(2).length > bit.length) break;
        bits.push(i.toString(2).padStart(bit.length, '0'))
    }
    return bits
}

/**
 * Returns a list of bit strings that are within
 * a certain radii from the origin bit
 * @param {*} bit 
 * @param {*} radii 
 * @returns a set that contains all the bit representations that are within a certain radius
 */
function get_locality(bit, radii) {
    let odds = get_odd_bits(bit).toString(2).padStart(bit.length / 2, "0")
    let even = get_even_bits(bit).toString(2).padStart(bit.length / 2, "0")
    // get all the possible matches
    // given m possible odds and n possible even
    // then the complexity of finding the matches are m x n or n^2 
    let allOdds = get_all_bits(odds, radii)
    let allEven = get_all_bits(even, radii)
    let allPairs = new Set()
    for (let i = 0; i < allOdds.length; i++) {
        for (let j = 0; j < allEven.length; j++) {
            let bit_pair = join_bit(allOdds[i], allEven[j])
            if (get_nearness(bit, bit_pair) <= radii) {
                allPairs.add(bit_pair)
            }
        }
    }
    return allPairs
}

function pad_prefix(point, tl_v, br_v, prefix = "", desiredLength = 16) {
    if (prefix.length === desiredLength) {
        return prefix;
    }

    if (prefix.length > 16) {
        return prefix.substring(0, desiredLength)
    }

    let LR_mid = tl_v.x + (br_v.x - tl_v.x) / 2
    let TB_mid = tl_v.y + (br_v.y - tl_v.y) / 2 
    let a = createVector(tl_v.x, tl_v.y)
    let b = createVector(LR_mid, tl_v.y)
    let c = createVector(br_v.x, tl_v.y)

    let d = createVector(tl_v.x, TB_mid)
    let e = createVector(LR_mid, TB_mid)
    let f = createVector(br_v.x, TB_mid)
    
    let g = createVector(tl_v.x, br_v.y)
    let h = createVector(LR_mid, br_v.y)
    let i = createVector(br_v.x, br_v.y)

    /**
     * [A][B][C]
     * [D][E][F]
     * [G][H][I]
     */

    if (point.pos.x < LR_mid) {
        // Left
        if (point.pos.y >= TB_mid) {
            // Bottom
            return pad_prefix(point, d, h, prefix + "00", desiredLength);
        } else {
            // Top
            return pad_prefix(point, a, e, prefix + "01", desiredLength);
        }
    } else {
        // Right
        if (point.pos.y >= TB_mid) {
            // Bottom
            return pad_prefix(point, e, i, prefix + "10", desiredLength);
        } else {
            // Top
            return pad_prefix(point, b, f, prefix + "11", desiredLength);
        }
    }
}
