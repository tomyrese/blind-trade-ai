// Enhanced AI Legit Check Scanner Screen
import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { Upload, Zap } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraPlaceholder } from '../features/scanner/components/CameraPlaceholder';
import { LaserScanner } from '../features/scanner/components/LaserScanner';
import { VerificationResult, VerificationStatus } from '../features/scanner/components/VerificationResult';

const SCAN_STEPS = [
  {
    step: '1',
    title: 'Quét Tài Sản',
    desc: 'AI phân tích hình ảnh và dữ liệu thị trường',
  },
  {
    step: '2',
    title: 'Xác Thực',
    desc: 'So sánh với database và pattern matching',
  },
  {
    step: '3',
    title: 'Kết Quả',
    desc: 'Nhận đánh giá chi tiết và độ tin cậy',
  },
];

export const ScannerScreen: React.FC = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>(null);
  const [confidence, setConfidence] = useState(0);

  const handleStartScan = useCallback(() => {
    setIsScanning(true);
    setVerificationStatus(null);

    // Simulate scanning process
    setTimeout(() => {
      setIsScanning(false);
      // Random result for demo
      const results: VerificationStatus[] = ['verified', 'suspicious', 'fake'];
      const randomStatus = results[Math.floor(Math.random() * results.length)];
      setVerificationStatus(randomStatus);
      
      // Set confidence based on status
      const confidenceMap: Record<string, number> = { verified: 95, suspicious: 68, fake: 42 };
      setConfidence(confidenceMap[randomStatus as string] || 0);
    }, 3000);
  }, []);

  const handleUploadMedia = useCallback(() => {
    console.log('Upload media clicked');
    // In real app, open image picker
  }, []);

  const details = useMemo(() => {
    if (verificationStatus === 'verified')
      return 'Tất cả các chỉ số đều đạt ngưỡng an toàn. Tài sản này đã được xác thực.';
    if (verificationStatus === 'suspicious')
      return 'Một số dấu hiệu không khớp với dữ liệu thị trường. Cần xem xét kỹ.';
    if (verificationStatus === 'fake')
      return 'Phát hiện nhiều dấu hiệu bất thường. Tài sản này có khả năng cao là giả mạo.';
    return undefined;
  }, [verificationStatus]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0f172a' }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingTop: 30 }}
      >

        {/* Camera/Scanner View */}
        <View style={{ position: 'relative', marginBottom: 24 }}>
          <CameraPlaceholder />
          <LaserScanner isScanning={isScanning} />

          {/* Scanning status overlay */}
          {isScanning && (
            <View
              style={{
                position: 'absolute',
                bottom: 20,
                left: 0,
                right: 0,
                alignItems: 'center',
              }}
            >
              <View
                style={{
                  backgroundColor: 'rgba(59, 130, 246, 0.9)',
                  paddingHorizontal: 20,
                  paddingVertical: 12,
                  borderRadius: 20,
                }}
              >
                <Text style={{ color: '#ffffff', fontWeight: '600', fontSize: 14 }}>
                  Đang Quét...
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 24 }}>
          <Pressable
            onPress={handleStartScan}
            disabled={isScanning}
            style={{
              flex: 1,
              backgroundColor: isScanning ? '#475569' : '#3b82f6',
              paddingVertical: 16,
              borderRadius: 12,
              alignItems: 'center',
              shadowColor: '#3b82f6',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
            }}
          >
            <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: 'bold' }}>
              {isScanning ? 'Đang Quét...' : 'Bắt Đầu Quét'}
            </Text>
          </Pressable>

          <Pressable
            onPress={handleUploadMedia}
            style={{
              backgroundColor: '#1e293b',
              paddingHorizontal: 20,
              paddingVertical: 16,
              borderRadius: 12,
              borderWidth: 2,
              borderColor: '#334155',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Upload size={24} color="#94a3b8" />
          </Pressable>
        </View>

        {/* Verification Result */}
        <VerificationResult
          status={verificationStatus}
          confidence={confidence}
          details={details}
        />

        {/* Info Cards */}
        <View style={{ marginTop: 24, gap: 12 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#ffffff', marginBottom: 8 }}>
            Cách Thức Hoạt Động
          </Text>
          {SCAN_STEPS.map((item, i) => (
            <View
              key={i}
              style={{
                backgroundColor: '#1e293b',
                borderRadius: 12,
                padding: 16,
                flexDirection: 'row',
                alignItems: 'center',
                borderWidth: 1,
                borderColor: '#334155',
              }}
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: '#3b82f6',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ color: '#ffffff', fontWeight: 'bold', fontSize: 16 }}>
                  {item.step}
                </Text>
              </View>
              <View style={{ marginLeft: 16, flex: 1 }}>
                <Text style={{ color: '#ffffff', fontSize: 14, fontWeight: '600' }}>
                  {item.title}
                </Text>
                <Text style={{ color: '#94a3b8', fontSize: 12, marginTop: 2 }}>
                  {item.desc}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
