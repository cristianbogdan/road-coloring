export const Color = {
    BLACK: '#000000',
    WHITE: '#ffffff',

    RED: '#ff0000',
    ORANGE: '#ff8000',
    YELLOW: '#ffff00',
    AMBER: '#ffbf00',
    GRAY: '#808080',

    BLUE: '#0000ff',
    DODGER_BLUE: '#199a8d',
    DEEP_SKY_BLUE: '#20c5b5',
    LIGHT_SKY_BLUE: '#40e0d0',
    POWDER_BLUE: '#91ede4',
    BLIZZARD_BLUE: '#AEEEEA',

    ORANGE_RED: '#ff4500',
    ROSE_PINK: '#ffbdbd',
    
    SHIP_COVE: '#6c7b8b'
}

export const LineWeight = {
    THIN: 2.0,
    THICK: 4.0,
    THICKER: 6.0
}

export const DashArray = {
    DENSE: [5, 7],
    SPARSE: [10, 10]
}

export const zoomPrecisionMap = new Map<number, number>();
zoomPrecisionMap.set(7, 8000);
zoomPrecisionMap.set(8, 4000);
zoomPrecisionMap.set(9, 2000);
zoomPrecisionMap.set(10, 1000);
zoomPrecisionMap.set(11, 500);
zoomPrecisionMap.set(12, 300);
zoomPrecisionMap.set(13, 200);
zoomPrecisionMap.set(14, 100);
zoomPrecisionMap.set(15, 50);
zoomPrecisionMap.set(16, 25);
zoomPrecisionMap.set(17, 15);
zoomPrecisionMap.set(18, 10);
