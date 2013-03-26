function modPow(B, E, M) {
    var result = 1;
    while (E > 0) {
        if ((E & 1) == 1)
            result = (result * B) % M;
        E >>= 1;
        B = (B * B) % M;
    }
    return result % M;
}

function S(j, d) {
    var sumLeft = 0;

    for (var k = 0; k <= d; k++) {
        var r = 8 * k + j; // 8k + j
        sumLeft += modPow(16, d - k, r) / r;
        sumLeft = sumLeft % 1.0;
    }

    var sumRight = 0;
    var k = d + 1;

    while (true) // #yolo
    {
        var sumConverge = sumRight + Math.pow(16, d - k) / (8 * k + j);
        if (sumRight == sumConverge)
            break;
        else
            sumRight = sumConverge;
        k++;
    }
    return sumLeft + sumRight;
}

function generateDigit(d) {
    var Sx = 4 * S(1, d);
    Sx -= 2 * S(4, d);
    Sx -= S(5, d);
    Sx -= S(6, d);

    if (Sx > 0)
        Sx -= parseInt(Sx);

    if (Sx < 0)
        Sx += (1 + parseInt(-Sx));

    Sx *= Math.pow(16, 14);
    var hex = Sx.toString(16);

    while(hex.length < 14)
      hex = "0" + hex;

    return hex;
}