import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const NotFound = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>404 - Page Not Found</Text>
            <Text style={styles.subText}>The page you are looking for does not exist.</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
    },
    text: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#343a40',
        marginBottom: 10,
    },
    subText: {
        fontSize: 16,
        color: '#6c757d',
    },
});

export default NotFound;