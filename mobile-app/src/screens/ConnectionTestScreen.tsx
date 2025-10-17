import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { connectionService } from '../services/api';

const ConnectionTestScreen = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [testResults, setTestResults] = useState<any[]>([]);

    const addResult = (test: string, success: boolean, data?: any, error?: any) => {
        const result = {
            test,
            success,
            data,
            error: error?.message || error,
            timestamp: new Date().toLocaleTimeString(),
        };
        setTestResults(prev => [result, ...prev]);
    };

    const testHealthCheck = async () => {
        try {
            const response = await connectionService.checkHealth();
            addResult('Health Check', true, response.data);
        } catch (error) {
            addResult('Health Check', false, null, error);
        }
    };

    const testApiConnection = async () => {
        try {
            const response = await connectionService.testConnection();
            addResult('API Connection', true, response.data);
        } catch (error) {
            addResult('API Connection', false, null, error);
        }
    };

    const runAllTests = async () => {
        setIsLoading(true);
        setTestResults([]);

        await testHealthCheck();
        await new Promise(resolve => setTimeout(resolve, 500));
        await testApiConnection();

        setIsLoading(false);
    };

    const clearResults = () => {
        setTestResults([]);
    };

    const showApiUrl = () => {
        const url = connectionService.getApiBaseUrl();
        Alert.alert('API Base URL', url);
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Backend Connection Test</Text>
                <Text style={styles.subtitle}>Test your mobile app's connection to the backend</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Connection Info</Text>
                <TouchableOpacity style={styles.infoButton} onPress={showApiUrl}>
                    <Ionicons name="information-circle" size={20} color="#3b82f6" />
                    <Text style={styles.infoText}>Show API URL</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Tests</Text>

                <TouchableOpacity
                    style={styles.testButton}
                    onPress={testHealthCheck}
                    disabled={isLoading}
                >
                    <Ionicons name="pulse" size={20} color="white" />
                    <Text style={styles.testButtonText}>Test Health Check</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.testButton}
                    onPress={testApiConnection}
                    disabled={isLoading}
                >
                    <Ionicons name="server" size={20} color="white" />
                    <Text style={styles.testButtonText}>Test API Connection</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.testButton, styles.primaryButton]}
                    onPress={runAllTests}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator color="white" size="small" />
                    ) : (
                        <Ionicons name="play" size={20} color="white" />
                    )}
                    <Text style={styles.testButtonText}>Run All Tests</Text>
                </TouchableOpacity>

                {testResults.length > 0 && (
                    <TouchableOpacity
                        style={[styles.testButton, styles.clearButton]}
                        onPress={clearResults}
                    >
                        <Ionicons name="trash" size={20} color="white" />
                        <Text style={styles.testButtonText}>Clear Results</Text>
                    </TouchableOpacity>
                )}
            </View>

            {testResults.length > 0 && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Test Results</Text>
                    {testResults.map((result, index) => (
                        <View key={index} style={[
                            styles.resultCard,
                            result.success ? styles.successCard : styles.errorCard
                        ]}>
                            <View style={styles.resultHeader}>
                                <View style={styles.resultTitle}>
                                    <Ionicons
                                        name={result.success ? "checkmark-circle" : "close-circle"}
                                        size={20}
                                        color={result.success ? "#10b981" : "#ef4444"}
                                    />
                                    <Text style={styles.resultTest}>{result.test}</Text>
                                </View>
                                <Text style={styles.resultTime}>{result.timestamp}</Text>
                            </View>

                            {result.success && result.data && (
                                <View style={styles.resultData}>
                                    <Text style={styles.dataTitle}>Response:</Text>
                                    <Text style={styles.dataText}>
                                        {JSON.stringify(result.data, null, 2)}
                                    </Text>
                                </View>
                            )}

                            {!result.success && result.error && (
                                <View style={styles.resultError}>
                                    <Text style={styles.errorTitle}>Error:</Text>
                                    <Text style={styles.errorText}>{result.error}</Text>
                                </View>
                            )}
                        </View>
                    ))}
                </View>
            )}

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Troubleshooting</Text>
                <View style={styles.troubleshootCard}>
                    <Text style={styles.troubleshootTitle}>If tests fail:</Text>
                    <Text style={styles.troubleshootText}>
                        1. Make sure the backend server is running on port 3003{'\n'}
                        2. If using a physical device, replace 'localhost' with your computer's IP address{'\n'}
                        3. Check that your device and computer are on the same network{'\n'}
                        4. Verify firewall settings allow connections on port 3003
                    </Text>
                </View>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9fafb',
    },
    header: {
        backgroundColor: 'white',
        padding: 20,
        paddingTop: 60,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 16,
        color: '#6b7280',
    },
    section: {
        backgroundColor: 'white',
        margin: 16,
        padding: 16,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 12,
    },
    infoButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        backgroundColor: '#eff6ff',
        borderRadius: 8,
    },
    infoText: {
        marginLeft: 8,
        color: '#3b82f6',
        fontWeight: '500',
    },
    testButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#6b7280',
        padding: 16,
        borderRadius: 8,
        marginBottom: 8,
    },
    primaryButton: {
        backgroundColor: '#3b82f6',
    },
    clearButton: {
        backgroundColor: '#ef4444',
    },
    testButtonText: {
        color: 'white',
        fontWeight: '600',
        marginLeft: 8,
    },
    resultCard: {
        padding: 12,
        borderRadius: 8,
        marginBottom: 8,
        borderWidth: 1,
    },
    successCard: {
        backgroundColor: '#f0fdf4',
        borderColor: '#bbf7d0',
    },
    errorCard: {
        backgroundColor: '#fef2f2',
        borderColor: '#fecaca',
    },
    resultHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    resultTitle: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    resultTest: {
        fontWeight: '600',
        marginLeft: 8,
        color: '#1f2937',
    },
    resultTime: {
        fontSize: 12,
        color: '#6b7280',
    },
    resultData: {
        marginTop: 8,
    },
    dataTitle: {
        fontWeight: '600',
        color: '#059669',
        marginBottom: 4,
    },
    dataText: {
        fontSize: 12,
        color: '#065f46',
        fontFamily: 'monospace',
        backgroundColor: '#ecfdf5',
        padding: 8,
        borderRadius: 4,
    },
    resultError: {
        marginTop: 8,
    },
    errorTitle: {
        fontWeight: '600',
        color: '#dc2626',
        marginBottom: 4,
    },
    errorText: {
        fontSize: 12,
        color: '#991b1b',
        backgroundColor: '#fef2f2',
        padding: 8,
        borderRadius: 4,
    },
    troubleshootCard: {
        backgroundColor: '#fef3c7',
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#fde68a',
    },
    troubleshootTitle: {
        fontWeight: '600',
        color: '#92400e',
        marginBottom: 8,
    },
    troubleshootText: {
        color: '#b45309',
        lineHeight: 20,
    },
});

export default ConnectionTestScreen;