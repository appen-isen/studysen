import { AnimatedPressable } from "@/components/Buttons";
import { Page, PageHeader } from "@/components/Page";
import { Text } from "@/components/Texts";
import { ColorPalette } from "@/constants/Colors";
import useColors from "@/hooks/useColors";
import { usePostDetailsStore } from "@/stores/clubsStore";
import { PostType } from "@/utils/types";
import { MaterialIcons } from "@expo/vector-icons";
import { Href, useRouter } from "expo-router";
import { Image, StyleSheet, View } from "react-native";
import { useMemo } from "react";
import { getResponsiveMaxWidth } from "@/utils/responsive";
import { getCardStyle } from "@/constants/Styles";

export default function PostDetailsScreen() {
    const { currentPost } = usePostDetailsStore();
    const colors = useColors();
    const postStyles = useMemo(() => createPostStyles(colors), [colors]);
    if (currentPost === null) {
        return (
            <Page>
                <PageHeader title="Post" returnTo="Clubs"></PageHeader>
                <Text style={{ textAlign: "center", marginTop: 20 }}>
                    Le post que vous cherchez n'existe pas.
                </Text>
            </Page>
        );
    }
    return (
        <Page>
            <PageHeader
                title={currentPost.type === "event" ? "Événement" : "Post"}
                returnTo="Clubs"
            ></PageHeader>
            <View style={postStyles.responsiveContainer}>
                <Post post={currentPost} details={true}></Post>
            </View>
        </Page>
    );
}

//Composant qui représente un post de club
export function Post(props: { post: PostType; details?: boolean }) {
    const {
        type,
        date,
        title,
        club,
        description,
        address,
        info,
        imageUri,
        link
    } = props.post;

    const router = useRouter();
    const { setCurrentPost } = usePostDetailsStore();
    const colors = useColors();
    const postStyles = useMemo(() => createPostStyles(colors), [colors]);

    //Lorsque l'on veut voir plus de détails sur le post ou aller sur le lien
    const handleViewDetails = () => {
        if (props.details) {
            //On va sur le lien
            if (link) {
                router.push(link as Href);
            }
        } else {
            //On va sur le post
            setCurrentPost(props.post);
            router.push("/post-details");
        }
    };
    return (
        <View style={postStyles.card}>
            {/* Type et date du post affichée seulement dans la liste des posts*/}
            {!props.details && (
                <View style={postStyles.row}>
                    <Text style={postStyles.badge}>
                        {type === "event" ? "ÉVÉNEMENT" : "POST"}
                    </Text>
                    <View style={postStyles.textSeparator}></View>
                    <Text style={postStyles.largeText}>{date}</Text>
                </View>
            )}

            {/* Bannière (environ 400x100) */}
            {imageUri && (
                <Image
                    source={{ uri: imageUri }}
                    style={postStyles.banner}
                ></Image>
            )}
            {/* Affichage de la date*/}
            {props.details && <Text style={postStyles.largeText}>{date}</Text>}

            {/* Titre du post */}
            <Text style={postStyles.title}>{title}</Text>
            {/* Club */}
            <View style={postStyles.clubBox}>
                <Image
                    source={{ uri: club.image }}
                    style={postStyles.clubImage}
                ></Image>
                <Text style={postStyles.clubName}>{club.name}</Text>
            </View>

            {/* Description du post */}
            {description.split("\\n").map((line, index) => (
                <Text key={index}>{line}</Text>
            ))}

            {/* Adresse */}
            {address && (
                <View style={postStyles.addressBox}>
                    <MaterialIcons
                        name="location-on"
                        size={20}
                        color={colors.primary}
                    />
                    <Text style={postStyles.addressText}>
                        {address.toUpperCase()}
                    </Text>
                </View>
            )}

            {/* Informations */}
            {info && (
                <View style={postStyles.row}>
                    {/* Début de l'événement */}
                    {info.startTime && (
                        <View style={postStyles.infoBox}>
                            <Text style={postStyles.infoTitle}>DÉBUT</Text>
                            <Text style={postStyles.infoText}>
                                {info.startTime}
                            </Text>
                        </View>
                    )}
                    {/* Prix */}
                    {info.price && (
                        <View style={postStyles.infoBox}>
                            <Text style={postStyles.infoTitle}>ENTRÉE</Text>
                            <Text style={postStyles.infoText}>
                                {info.price}
                            </Text>
                        </View>
                    )}
                    {/* Âge minimum */}
                    {info.ageLimit && (
                        <View style={postStyles.infoBox}>
                            <Text style={postStyles.infoTitle}>
                                ÂGE MINIMUM
                            </Text>
                            <Text style={postStyles.infoText}>
                                {info.ageLimit} ans
                            </Text>
                        </View>
                    )}
                </View>
            )}

            {/* Voir plus */}

            {!props.details && (
                <AnimatedPressable
                    onPress={handleViewDetails}
                    scale={0.95}
                    style={postStyles.viewButton}
                >
                    <Text style={{ color: colors.white }}>
                        Voir {type === "event" ? "l'événement" : "le post"}
                    </Text>
                    <MaterialIcons
                        name="arrow-forward"
                        size={24}
                        color="white"
                    />
                </AnimatedPressable>
            )}

            {/* Réserver ou ouvrir le lien*/}
            {props.details && props.post.link && (
                <AnimatedPressable
                    onPress={handleViewDetails}
                    scale={0.95}
                    style={postStyles.linkButton}
                >
                    {/* Icône selon le type de post */}
                    {type === "event" ? (
                        <MaterialIcons name="sell" size={24} color="white" />
                    ) : (
                        <MaterialIcons name="link" size={24} color="white" />
                    )}
                    <Text style={postStyles.linkText}>
                        {type === "event" ? "Réserver" : "Ouvrir le lien"}
                    </Text>
                </AnimatedPressable>
            )}
        </View>
    );
}

const createPostStyles = (colors: ColorPalette) =>
    StyleSheet.create({
        row: {
            flexDirection: "row",
            alignItems: "center"
        },
        card: {
            ...getCardStyle(colors),
            padding: 15,
            marginTop: 15
        },
        responsiveContainer: {
            maxWidth: getResponsiveMaxWidth(),
            width: "100%",
            alignSelf: "center"
        },
        //Textes
        textSeparator: {
            width: 20,
            height: 3,
            borderRadius: 10,
            marginHorizontal: 10,
            backgroundColor: colors.black
        },
        largeText: {
            fontSize: 20
        },
        title: {
            fontSize: 20,
            marginVertical: 5,
            fontWeight: "bold"
        },
        badge: {
            borderRadius: 10,
            backgroundColor: colors.hexWithOpacity(colors.primary, 0.1),
            padding: 10,
            fontSize: 11,
            fontWeight: "bold",
            color: colors.primary
        },
        //Bannière
        banner: {
            width: "100%",
            height: 100,
            borderRadius: 15,
            marginVertical: 15
        },
        //Nom du club
        clubBox: {
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: colors.light,
            padding: 6,
            borderRadius: 50,
            marginTop: 5,
            marginBottom: 20,
            alignSelf: "flex-start"
        },
        clubImage: {
            width: 30,
            height: 30,
            borderRadius: 100
        },
        clubName: {
            fontWeight: 600,
            marginLeft: 5
        },
        //Adresse
        addressBox: {
            flexDirection: "row",
            alignItems: "center",
            alignSelf: "flex-start",
            gap: 10,
            marginTop: 10,
            backgroundColor: colors.hexWithOpacity(colors.primary, 0.1),
            padding: 10,
            borderRadius: 5
        },
        addressText: {
            fontSize: 12,
            fontWeight: 600,
            color: colors.primary
        },
        //Informations
        infoBox: {
            padding: 10,
            borderRadius: 5,
            justifyContent: "center",
            marginTop: 15,
            marginRight: 15,
            backgroundColor: colors.light
        },
        infoTitle: {
            fontWeight: "bold",
            color: colors.gray,
            fontSize: 10
        },
        infoText: {
            fontSize: 16
        },
        viewButton: {
            backgroundColor: colors.primary,
            padding: 10,
            paddingHorizontal: 20,
            borderRadius: 5,
            flexDirection: "row",
            alignItems: "center",
            alignSelf: "flex-start",
            gap: 15,
            marginTop: 20
        },
        linkButton: {
            backgroundColor: colors.primary,
            padding: 10,
            paddingHorizontal: 20,
            borderRadius: 50,
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            gap: 15,
            marginTop: 20
        },
        linkText: {
            color: colors.white,
            fontSize: 18,
            fontWeight: "bold"
        }
    });
