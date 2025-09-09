// Apps/mobile/babel.config.js
module.exports = function (api) {
    api.cache(true);
    return {
        presets: ['babel-preset-expo'],
        plugins: [
            'expo-router/babel',
            require.resolve('react-native-reanimated/plugin'),
        ],
    };
};