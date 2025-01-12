import PushNotification from "react-native-push-notification";

PushNotification.configure({
    onRegister: function (token) {
        console.log("TOKEN:", token);
    },
    onNotification: function (notification) {
        console.log("NOTIFICATION:", notification);
        notification.finish(PushNotificationIOS.FetchResult.NoData);
    },
    permissions: {
        alert: true,
        badge: true,
        sound: true,
    },
    popInitialNotification: true,
    requestPermissions: true,
});

// Exemple pour envoyer une notification locale
export const sendLocalNotification = () => {
    PushNotification.localNotification({
        title: "My Notification Title",
        message: "My Notification Message",
    });
};