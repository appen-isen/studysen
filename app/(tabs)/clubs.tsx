import { Page, PageHeader } from "@/components/Page";
import { PostType } from "@/utils/types";
import { FlatList, StyleSheet, View, RefreshControl } from "react-native";
import { Post } from "../post-details";
import { DotLoader } from "@/components/Sync";
import { useEffect, useState, useCallback } from "react";
import { API_BASE_URL } from "@/utils/config";
import Colors from "@/constants/Colors";
import { Bold, Text } from "@/components/Texts";
import useSettingsStore, { CAMPUS, campusToId } from "@/stores/settingsStore";
import { usePostsStore } from "@/stores/clubsStore";
import { SafeAreaView } from "react-native-safe-area-context";
import { getResponsiveMaxWidth } from "@/utils/responsive";
import { AnimatedPressable } from "@/components/Buttons";
import { Dropdown } from "@/components/Modals";
import { MaterialIcons } from "@expo/vector-icons";
import { fetch } from "expo/fetch";
import { useFocusEffect } from "expo-router";
import useSessionStore from "@/stores/sessionStore";
import { generateDemoPosts } from "@/webAurion/utils/demo";

export default function ClubsScreen() {
    const [posts, setPosts] = useState<PostType[]>([]);
    const [isFirstLoading, setIsFirstLoading] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [offset, setOffset] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [campusMenuVisible, setCampusMenuVisible] = useState(false);
    const { settings, setSettings } = useSettingsStore();
    const { markPostsAsViewed, setLastSeenPostId } = usePostsStore();

    // Marquer les posts comme vus quand l'utilisateur ouvre cet onglet
    useFocusEffect(
        useCallback(() => {
            markPostsAsViewed();
        }, [markPostsAsViewed])
    );

    const fetchLatestPost = async (
        offset: number
    ): Promise<PostType | null> => {
        // Pour l'utilisateur en mode démo, on renvoie un post de démo
        if (useSessionStore.getState().session?.isDemo()) {
            if (offset === 0) {
                return generateDemoPosts()[0];
            }
            return null;
        }
        try {
            //On récupère le X dernier post
            const response = await fetch(
                `${API_BASE_URL}/posts/last?offset=${offset}&campus=${campusToId(
                    useSettingsStore.getState().settings.campus
                )}`
            );
            if (!response.ok) return null;
            return (await response.json()) as PostType;
        } catch (error) {
            return null;
        }
    };

    // Fonction pour rafraîchir les posts
    const onRefresh = async () => {
        setIsRefreshing(true);

        // Réinitialiser les états
        setPosts([]);
        setOffset(0);
        setHasMore(true);

        // Recharger les 3 premiers posts
        let localOffset = 0;
        const newPosts: PostType[] = [];

        for (let i = 0; i < 3; i++) {
            const newPost = await fetchLatestPost(localOffset);
            if (newPost) {
                newPosts.push(newPost);
                localOffset += 1;
            } else {
                setHasMore(false);
                break;
            }
        }

        setPosts(newPosts);
        setOffset(localOffset);
        setIsRefreshing(false);
    };

    // Fonction pour charger un post
    const loadPosts = async () => {
        setIsLoading(true);
        const newPost = await fetchLatestPost(offset);
        if (newPost) {
            setPosts((prev) => [...prev, newPost]);
            setOffset((prev) => prev + 1);
        } else {
            setHasMore(false);
        }
        setIsLoading(false);
    };

    // Chargement initial des 3 premiers posts
    useEffect(() => {
        const loadInitialPosts = async () => {
            let localOffset = offset;
            for (let i = 0; i < 3; i++) {
                const newPost = await fetchLatestPost(localOffset);
                if (newPost) {
                    // On ajoute le post à la liste des posts
                    setPosts((prev) => [...prev, newPost]);

                    localOffset += 1;
                } else {
                    setHasMore(false);
                    break;
                }
            }
            setOffset(localOffset);
            setIsFirstLoading(false);
            setIsLoading(false);
        };

        loadInitialPosts();
    }, []);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <PageHeader title="Clubs">
                    {/* Bouton pour choisir le campus */}
                    <AnimatedPressable
                        style={styles.campusSelect}
                        onPress={() => setCampusMenuVisible(true)}
                    >
                        <Text style={styles.campusSelectText}>
                            Campus de {settings.campus}
                        </Text>
                        <MaterialIcons name="keyboard-arrow-down" size={24} />
                    </AnimatedPressable>
                </PageHeader>
                <FlatList
                    data={posts}
                    contentContainerStyle={styles.scrollContainer}
                    keyExtractor={(_, index) => index.toString()}
                    renderItem={({ item }) => <Post post={item} />}
                    refreshControl={
                        <RefreshControl
                            refreshing={isRefreshing}
                            onRefresh={onRefresh}
                            colors={[Colors.primary]} // Android
                            tintColor={Colors.primary} // iOS
                        />
                    }
                    onEndReached={() => {
                        // Si le chargement initial est terminé, on charge les nouveaux posts
                        // On ne charge plus si le dernier fetch n'a rien ramené
                        if (!isFirstLoading && !isLoading && hasMore) {
                            loadPosts();
                        }
                    }}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={
                        isLoading ? (
                            <DotLoader />
                        ) : !hasMore && posts.length === 0 ? (
                            <Bold style={styles.noPostsText}>
                                Aucun post à afficher
                            </Bold>
                        ) : null
                    }
                />
                {/* Menu pour choisir le campus */}
                <Dropdown
                    visible={campusMenuVisible}
                    setVisible={setCampusMenuVisible}
                    options={[...CAMPUS]}
                    selectedItem={settings.campus}
                    setSelectedItem={(newCampus) => {
                        setSettings(
                            "campus",
                            newCampus as (typeof CAMPUS)[number]
                        );
                        setLastSeenPostId(null);
                        // On rafraîchit les posts après le changement de campus
                        onRefresh();
                    }}
                    modalBoxStyle={styles.dropdownBoxStyle}
                ></Dropdown>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.white
    },
    content: {
        flex: 1,
        paddingBlock: 10,
        paddingInline: 20,
        backgroundColor: Colors.white,
        gap: 25
    },
    scrollContainer: {
        maxWidth: getResponsiveMaxWidth(),
        width: "100%",
        alignSelf: "center"
    },
    noPostsText: {
        fontSize: 20,
        alignSelf: "center"
    },
    //
    // Campus selection
    //
    campusSelect: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 15,
        paddingVertical: 8,
        backgroundColor: Colors.light,
        borderRadius: 999,
        gap: 5
    },
    campusSelectText: {
        color: Colors.black,
        fontSize: 14,
        fontWeight: 600
    },
    dropdownBoxStyle: {
        width: 250,
        display: "flex",
        justifyContent: "flex-start",
        alignItems: "flex-start"
    }
});
