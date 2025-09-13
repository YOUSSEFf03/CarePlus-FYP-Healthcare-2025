import React from 'react';
import { View, Text, StyleSheet, Image, ImageBackground } from 'react-native';
import Button from '../../src/components/Button';
import CustomText from '../../src/components/CustomText';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, fontFamily, fontSize, spacing, radius, shadow } from '../../src/styles/tokens';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { RootStackParamList } from '../../App';

export default function Home() {
    return (
        <SafeAreaView style={styles.safe} edges={['bottom']}>
            <View style={styles.container}>
                <CustomText variant="text-heading-H1" style={styles.title}>Home Screen</CustomText>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing[4],
        backgroundColor: colors.white,
    },
    title: {
        fontFamily: fontFamily.poppinsRegular,
        fontSize: fontSize[32],
        color: colors.black,
    },
});