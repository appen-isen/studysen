export type PostType = {
    type: "event" | "post";
    date: string;
    title: string;
    club: {
        name: string;
        image: string;
    };
    description: string;
    link?: string;
    address?: string;
    info?: {
        startTime?: string;
        price?: string;
        ageLimit?: string;
    };
    imageUri?: string;
};
