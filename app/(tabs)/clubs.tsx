import { AnimatedPressable } from "@/components/Buttons";
import { Page, PageHeader } from "@/components/Page";
import { Text } from "@/components/Texts";
import Colors from "@/constants/Colors";
import { MaterialIcons } from "@expo/vector-icons";
import { Image, StyleSheet, View } from "react-native";

export default function ClubsScreen() {
    return (
        <Page style={styles.container}>
            <PageHeader title="Clubs"></PageHeader>
            <Post
                type="post"
                date="23/04/2025"
                title="L'application ISEN Orbit"
                club={{
                    name: "Appen",
                    image: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAAXNSR0IArs4c6QAAD9tJREFUaIGtmnuUXXV1xz/79zv3Me87eUzIJCEJL5WlkgCC1rqkgghaFRStWqqkXdrKWi3YLm0ttSTLB7XWB60VqEsIC99WBaRgQI0ovlCSiQQVQpIhz5lkJnPnPfee89u7f/zOncxMJuGx2H/cmXXuOb+z9/7t/d3fvX9XeB7EzCpTabjMkDWFxFZ6WKMqFedcRVAQANcL9ALbgB8DPSLS+3y8/zkrXQ/1a7Ms3Tw6qvb1u0btL67eYT/8WdWykFpQtczU1NRM7Xiy1cyuMrNVz1UPeS6KQ3aNqbsWo7KnP+PTn+/niR0pvriA008b5VP/upxEDEQwDHC4p3/TRmDDs90V9yyVvx6z3aZu/VRK5Xs/qPI3H+zjSLXAhuuW8OIzp2jtSPBigJCqUlPBVDEzVPVEy18F7Daz6593A8xslZpuNVhvWOVA/xQbbniSz31+hGLSxIIOpVD0DB0ylnc5BCEDtvZOcd0de/nNnnFStWeq03oz2/1Mw+ppDTCz9wBbBVkjGEGMIyOTOJ3ihvWL+cKnOlnYUePD6/ezc3+BZV0lDKilxi2bqhycbOK/N49w25Yh9k2maKYEy1AzMAMM0BhqR21cBWw1s8ueqdXHU/762TmnFkJqWUitnmZWC8FUa1avZfbte0ftjy993Lb8ftzqmtrXflq1N9+w17b31WzrwQn7x3v32F/d1We/G0otaGaqlid4sOk813mz/YQhddwdyB9cP/ui4Jzg8BRwFHFgRXCOzopQLmZ0d3l2769z66YqZ7+gjVO7HC/uKvPPF69gUWcrD+waQQ0Ujb4XA8kQAjp/oq8/kRHzGpBv3fp5v8ODE8wLJilBjVqmVCrK8qVH8EnC7d8foa3YyZYn+rnxgQEO1WGgljE4NoVzCuIwFFMDdZi5fO3jJvn6PJSPkWNszpNnK1CZq3qMVUcjWE2Ve380wpe/PsC693Tx8nPa6N0/yce/2Mvfv3slHYsLfONXVR4/kkGpiZbmlI9dsphUM+7bNc4Fp3SwuiQkAmL5usfH2yqwdi7MzmfA7jyJjvE9KJhgJiDwVH/G1dceYHB4GcXSMC87q8771y2gUMhYflIziRiTJmzbP87geMoLu5tY0pbwlR1jfLevzOLmjIuXOt60rIm2/C1OBDMQMTCJ75VpNXtEZO1xDZg37mfqn9MCC0Jm8PFP9/PAgwtQEtQM7zK6lg5wxVsS3nThYpqLQgRVJSAgxpbBjE9uHWeoqZ2kCYou5aWtGW9ZWuQl5YSiU0x8rpjlf2WmqhtEZFrH6RzIQ2d+5QFEURGMGL+/7Blj8y8KpOYxEwyom6dvbBm33hXYtbeKx6InUbwZY+q4ffsEQ7TjxaHqmHQlHqaZfzuYsnEoZX/Id8AyBANzc/18TWQDcww4ofK5F6I/jInJwMY7DlNLOxAxgoA5h5cECROc/1LHC1a1geS5Ip46wv07R/nDWCsmjkwFE6GRUtVCM3fXCnx2sM5DU4FRhECjVsySCnDtLANy78+b5dNiEpc0JQvQ2eTxNoE3kDxMHBnLFgzzvss7KHtHiHsACrtGMu78Q0qQBGcgKDHMDcEwpyjC477MjROBmybr7DBPOn9OT+9CYwcuOI7WR5OXgDOH4Olo93ziEyu57gPK0kV7SfwkhuCY5J2XNbG8u4RhCAoWmAzG7b+uciDrQGJ8gFhO9AQTI8kchlAXYbxUYjNlPjUxxf9lxiS5Co3dMCo5d5o24JoTG9C41UACiFF0gdde2MEX/utkXveqQ5RkgDNPH+bS13TgcYh4UCPgeHDnOFv6EtQaueQw8TiiLYEEdULwRmKGaECc0Fcu81Uy7qpNMiohlj6bTok3A0gePruPVZwczvJLGt8WRBDAGVh+LTXl0d9N0NyUccbqCt5Fv6gZh2qBf/jOMHtkAb4pQMmgXMCVwJeUlkLGWJPHlRSKHkqQ+IAUQMsJhtGa1VgnwkVJgRIuOhEPSKcD1pzI86pMo4wZSMhwKIghzhARCl445yWtvOi0CuLzqiqGauCbv6qyZ7wdUQM8YoLPydspbowPneK4oDROOU0Rg8QENYeIIJohThhPStyjgb0Wd0CtAShc5uaP/6OZL7kRj2wfYrgmqGtAW1QyopNDZyB2g+n8tq/O3dscwXlMIk1wJpg5msMEf3ZykfNalKuXN/HexZ7VWQqW4RKPiieIw4BEhH5f4KE0EIBYXQBY44CzjjUgWmgRfOh5bIzrPjrF+z+wl1/1pNSz/ItpfG6UnfhpKBMpfOaeYSap4EUAh1hjXeVlnY5XLCzhxdPpEt7QXuJfuhMu8TUKWT2yitxRSqCeJPQgDIvE0I2yygGr56ofvRk/MzNu2TjEyPhievd18U8fGeDTN+1nf3+GKTmPD0dVNyOocM8vBtk71BaTX8FpDsNiLHLDvG1VQlGURq12KEsT48pKC68i5GGq0Y3iAceAg+psvnSWA1Ye6/+4MAQ2bTrC9h0LUU0QLVLT5dy5aRF/+6FDbH6on8xC3vWCM4/g2HM48M3NAbQZR8CrYHklL2qdN5wknN4s+TtyvoPg1FEx5cLWIiXLoi7mEANnypQYQxZmhnhlXjotISLI3r7ALbfXyEIZc5CZQ8WhFDk40M6+fQEnDsxhAcwCtaDcevdh+scXkqIYcXdUIgqUE2FlVwvmHNboCySGozlBRWkXR9HAqxwNTDHUCZnNotzzG2A4VIVb79jN4MgiQBBTnAQQxSm8cNUgb33LsqMEwylq8LPfjPLzbWUQFzHfPJlXTEBFGLIin3lkgjueGOVIBhHdlSCN8E3YlSmT4nPIjutnOJxBi8SQa4jLeXYsdAAEglMw5U/f2M3aNf2IH0dFEIOCCe0tI1x1ZYWWoiKmiICacriq3LRxnKmsDROHWQGxPIEBb1AwY9y1842BVj7y2Cg/GqwzmTczdZRH08C3x+tMek/qBBFDc6+3aUZFZvs8wXTYxFVsRvpi4HzK2We0cMZHWrjljhG+8+0awRcRqfFH50/yivMWIuJiKbXIa778jcMcGFwICwux/SQgCN4sryVK5lysHybsTFu5+eAkPxgdZkVzkQmFx8U4UC4gQKJGcA4nhlflDBwLp/FOAHoTxHoEVrqclJnAU3tqdC0pIgY7e2v85uEpRFoxgZMXHWbdu06iID7fsgRD2fZYnfseSCBJcnKXISaoi9XcW2xHY0LmiOSEUddMT1Zm+xSIF7QUWark7aWYw5nRkgZe7hOKJkdDSHgqAd+LgZgRzNiyfYzr1h+iWO5AJGNkrEQ9W0TwjqIN8Zd/3sLJ3cUImpFLMDoOn/2fI4zWFlEoCGYRl1TAkVIppkypJw1NBDOcs8iHcros4lAneA/mYzcmkPcfMc7XirLWJUyHiABITwJpD+IxjLoZt39tmJHaCtxkgUAAn2AS8AzyrrcGLr5wCSIZkKAaMPN87/4hntzTiVBCzBEwvDnEUhZYlQ9fsoDte0e4b1+dQd+KmSF4nDqwOJ1wSrxuEQYNjzNICJxam+KKUpkOiYZHVioAP06gcKeht5nBwGBKrT5GoZSQ1jxOSqhO8KLThPdc2cL5ZzXlsCmIKE4S+gaUr3wzEOpNiMvHJIBJoBgCbz27yMsWec7tqvDK05SN2wZ5NG2lTjkv5oZXy8Mu50s4vBp45dSJlPc2N7GaRt/BzA6tJ26IZZvBXWAW27m+YWNX7wiaOVZ2t9J9kpDkxM1yIibmSNX42L/3sekni4AC4gWaA67ikErgnDOGueGqBZRESVxEowkzfn5onG/tnKI3acGaS1ASKAElxRcc3gcWJHUu8nBRucTS6R55lvSIyNokz4a7zLggbq3Q3Q5LX9oek0lifmijtbZ820X44U+H+NGDDpICpjkgCThntPhh3n1xC2VRnIvNimA0Scarl5Q5e3Er2wYneGRsiKdUyIKnUBOWFIqcmhjnlous8h6nAfEGx5pw4/RemFklH6dURGS6Ulsjg2J3GrfQIpk6MJTx13+3l4HqcjIKOAwngjYbTZ113viaMa55eydJUMx5cA4TEM1wkuREMdbpbBpzjAKQNKDccl38fOWW1SLS6wBEpCoiN4rE0h0k71VF8+7P5ZQ5dlR1M776rUMMDi9HKZCgOCz3vrK8c4QrL64gCFPeMBe979HoEMliP4FSMKPJjGaUFgJFM5wpKkZwdrzh58bGgGvm15+LVXmaSOfRpTnvbwSB8MSOSe6735NSiA16Az0Mym6cd7yuSFeH8dv9U1z/v4fZ1lfL554xd1Cfo4+fMTaRnKKDicTWEnImdYxsaPwzbYCIVGNcuWmCi7jp3PdERojB/r5RWpsFR50ISpFkGcrLz5ngkle0MZoK//ndIXYeaeXGB6p88eEh9o1naHCoNBilggs5KOTqNLiORD3mmTTOOsWZb7S4df428+hUoBaMJ3fWuPnWAbZsb0OtnUyUjlKVm25s5ZTuIl9+cICv/zLw0XWdGPCtniqjIbDu3IWc01XCOc0xXwjEahu5/wmPLHpFZFb/Mt/dlzcI3myJyGNiFL3wojMSbtjQzQevVhYt7CNhiHe/3ThluWfH/hrffShQU+HXT06wstPx4YuW8NozO9g1OMwEMFCLE4vY5tp0iJ1AqsCfzL0479jIzK4Cbpt9MRadONhtzIocmgUOj8APH9jN6y9dhS8kfPRLBxmrCe+8fAF3P3yYoVT54OsXc2qnI4hw31Mp9+4aY8OrlrDUW0wDk0jXjwM5wOUicufci8l8d4rIxnzccvRgIW9IpDGhFolM3jlOqsA7r1iFifD73eNseyzj3PNbOXu54+wV3fz490fwpngKPDma8Z3ddQ5LC3vG6yxp8zjzuePcjEH0LNkwn/LH3YFpp5utn2VEvDrrscZcorFcUGPb7iluvucQhbLnXa9dyLkriniv1M3xH48M01v31MvCFd2eN3W3UM0Cj45PcFZbCxV3TFTPmkbPlRNmTP7gnJyYbfPc8bdzylmrS3zyfct45Zo2bv7+QTb+dICA4ydP1fntYODKFzSxIsmo1oXUlPuHJvnq/pSBWjpz6Sqw7kTKc7wQmmPEnWbWA2ye/+BjjpjDSaBSFt52XhtrV5fYf3icwSnjrj9M8soVRc5bmLCl3xjIAgfrxqb+KS7uamFZudBYpSeP+ac99H5G58Qi0oCvDU9/c+T3Io6CCC/sSnj1me2MTtRY1TLJO05voSywuOzZV0/40r46i0sFXrOgRBGt5iFzzFHS8yZmtsrMNh731w8aTNUsxFPZeDSrwepZapNZsCwEC6p234Fxe+PDE3b51lHbPFwfqqW2fubBxTOVZ/VTA47uxlX5QGxd/uuTGTdEJJm5sBMhcY6yA+9ig7+82WOWPbiY+geq7YXVpYKsz9nAs9Pn2T4wn+SQuyafs67Jc2XmwKwKDOex3Zv/vfO5KDxX/h/z7KAWqSk67AAAAABJRU5ErkJggg=="
                }}
                description="Bienvenue sur ISEN Orbit, l’application créée par les étudiants pour les étudiants.\n\nOn attend avec impatience votre avis !"
                address="21 quai des antilles, 44200 Nantes"
                info={{
                    price: "Gratuite",
                    ageLimit: "18 ans",
                    startTime: "18h30"
                }}
                imageUri="data:image/png;base64,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"
            ></Post>
        </Page>
    );
}

type PostProps = {
    type: "event" | "post";
    date: string;
    title: string;
    club: {
        name: string;
        image: string;
    };
    description: string;
    address?: string;
    info?: {
        startTime?: string;
        price?: string;
        ageLimit?: string;
    };
    imageUri?: string;
};
//Composant qui représente un post de club
function Post(props: PostProps) {
    const { type, date, title, club, description, address, info, imageUri } =
        props;
    return (
        <View>
            {/* Type et date du post */}
            <View style={postStyles.row}>
                <Text style={postStyles.badge}>
                    {type === "event" ? "ÉVÉNEMENT" : "POST"}
                </Text>
                <View style={postStyles.textSeparator}></View>
                <Text style={postStyles.largeText}>{date}</Text>
            </View>
            {/* Bannière (environ 400x100) */}
            {imageUri && (
                <Image
                    source={{ uri: imageUri }}
                    style={postStyles.banner}
                ></Image>
            )}
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
                        color={Colors.primary}
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
                                {info.ageLimit}
                            </Text>
                        </View>
                    )}
                </View>
            )}

            {/* Voir plus */}
            <AnimatedPressable
                onPress={() => {}}
                scale={0.95}
                style={postStyles.viewButton}
            >
                <Text style={{ color: Colors.white }}>
                    Voir {type === "event" ? "l'événement" : "le post"}
                </Text>
                <MaterialIcons name="arrow-forward" size={24} color="white" />
            </AnimatedPressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: 25
    }
});

const postStyles = StyleSheet.create({
    row: {
        flexDirection: "row",
        alignItems: "center"
    },
    //Textes
    textSeparator: {
        width: 20,
        height: 3,
        borderRadius: 10,
        marginHorizontal: 10,
        backgroundColor: Colors.black
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
        backgroundColor: Colors.hexWithOpacity(Colors.primary, 0.1),
        padding: 10,
        fontSize: 11,
        fontWeight: "bold",
        color: Colors.primary
    },
    //Bannière
    banner: {
        width: "100%",
        height: 100,
        borderRadius: 15,
        marginTop: 15
    },
    //Nom du club
    clubBox: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: Colors.light,
        width: "25%",
        padding: 5,
        borderRadius: 50,
        marginVertical: 5
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
        backgroundColor: Colors.hexWithOpacity(Colors.primary, 0.1),
        padding: 10,
        borderRadius: 5
    },
    addressText: {
        fontSize: 12,
        fontWeight: 600,
        color: Colors.primary
    },
    //Informations
    infoBox: {
        padding: 10,
        borderRadius: 5,
        justifyContent: "center",
        marginTop: 15,
        marginRight: 15,
        backgroundColor: Colors.light
    },
    infoTitle: {
        fontWeight: "bold",
        color: Colors.gray,
        fontSize: 10
    },
    infoText: {
        fontSize: 16
    },
    viewButton: {
        backgroundColor: Colors.primary,
        padding: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        flexDirection: "row",
        alignSelf: "flex-start",
        gap: 15,
        marginTop: 20
    }
});
