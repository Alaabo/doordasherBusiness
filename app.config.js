export default ({ config }) => ({
    expo: {
        name: "djawaddeliverybusiness",
        slug: "djawaddeliverybusiness",
        owner: "alaabourega",
        version: "1.0.0",
        orientation: "portrait",
        icon: "./assets/images/logo.png",
        scheme: "djawaddeliverybusiness",
        userInterfaceStyle: "automatic",
        newArchEnabled: true,
        developmentClient: {
            silentLaunch: false
        },
        extra: {
            eas: {
                projectId: '77bb36d7-ad46-4174-952a-edd8695f43f3'
            },
            cli: {
                appVersionSource: "remote" // This addresses the first warning
            }
        },
        ios: {
            supportsTablet: true,
            config: {
                googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY,
            },
        },
        android: {
            package: "com.Alaabo.djawaddeliverybusiness", // This MUST be unique
            versionCode: 1,
            adaptiveIcon: {
                foregroundImage: "./assets/images/logo.png",
                backgroundColor: "#F44336",
                googleServicesFile: false,
            },
            config: {
                googleMaps: {
                    apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY,
                }
            }
            ,
            intentFilters: [
                {
                    action: "VIEW",
                    data: [{ scheme: "djawaddeliverybusiness" }],
                    category: ["BROWSABLE", "DEFAULT"]
                }
            ]
        },
        web: {
            bundler: "metro",
            output: "static",
            favicon: "./assets/images/logo.png",
        },
        plugins: [
            "expo-router",
            [
                "expo-splash-screen",
                {
                    image: "./assets/images/logo.png",
                    resizeMode: "contain",
                    backgroundColor: "#1a7449",
                    enableFullScreenImage_legacy: true,
                },
            ],
            [
                "expo-font",
                {
                    fonts: [
                        "./assets/fonts/Poppins-Black.ttf",
                        "./assets/fonts/Poppins-Bold.ttf",
                        "./assets/fonts/Poppins-Light.ttf",
                        "./assets/fonts/Poppins-Thin.ttf",
                        "./assets/fonts/Poppins-Medium.ttf",
                        "./assets/fonts/Poppins-Regular.ttf",
                        "./assets/fonts/Poppins-SemiBold.ttf",
                    ],
                },
            ],
        ],
        experiments: {
            typedRoutes: true,
        },
    },
});
