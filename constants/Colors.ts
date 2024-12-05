export default {
    primaryColor: "#E30613",
    secondaryColor: "#FA4747",
    hexWithOpacity: (hex: string, opacity: number) => {
        const alpha = Math.round(opacity * 255)
            .toString(16)
            .padStart(2, "0");
        return `${hex}${alpha}`;
    },
};
