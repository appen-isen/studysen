export default {
    primary: "#FA4747",
    secondary: "#FFEDED",

    black: "#141414",
    darkGray: "#505050",
    gray: "#868686",
    lightGray: "#CACACA",
    light: "#E7E7E7",
    white: "#FFFFFF",

    hexWithOpacity: (hex: string, opacity: number) => {
        const alpha = Math.round(opacity * 255)
            .toString(16)
            .padStart(2, "0");
        return `${hex}${alpha}`;
    },
};
