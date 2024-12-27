export default {
    primaryColor: "#FA4747",
    secondaryColor: "#E30613",
    gray: "#868686",
    hexWithOpacity: (hex: string, opacity: number) => {
        const alpha = Math.round(opacity * 255)
            .toString(16)
            .padStart(2, "0");
        return `${hex}${alpha}`;
    },
};
