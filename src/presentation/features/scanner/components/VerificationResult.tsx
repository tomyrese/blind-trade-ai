// Verification Result UI
import React from 'react';
import { View, Text } from 'react-native';
import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react-native';

export type VerificationStatus = 'verified' | 'suspicious' | 'fake' | null;

interface VerificationResultProps {
  status: VerificationStatus;
  confidence?: number;
  details?: string;
}

export const VerificationResult: React.FC<VerificationResultProps> = ({
  status,
  confidence = 0,
  details,
}) => {
  if (!status) return null;

  const statusConfig = {
    verified: {
      icon: CheckCircle,
      color: '#10b981',
      bgColor: '#d1fae5',
      titleVi: 'Thẻ Thật',
      messageVi: 'Thẻ này có vẻ là hàng chính hãng',
    },
    suspicious: {
      icon: AlertTriangle,
      color: '#f59e0b',
      bgColor: '#fef3c7',
      titleVi: 'Đáng Ngờ',
      messageVi: 'Phát hiện một số dấu hiệu lạ',
    },
    fake: {
      icon: XCircle,
      color: '#ef4444',
      bgColor: '#fee2e2',
      titleVi: 'Hàng Giả',
      messageVi: 'Thẻ này có dấu hiệu giả mạo',
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <View
      style={{
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 24,
        marginTop: 24,
        borderWidth: 2,
        borderColor: config.color,
      }}
    >
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
        <View
          style={{
            backgroundColor: config.bgColor,
            borderRadius: 12,
            padding: 12,
          }}
        >
          <Icon size={32} color={config.color} strokeWidth={2.5} />
        </View>
        <View style={{ marginLeft: 16, flex: 1 }}>
          <Text style={{ fontSize: 22, fontWeight: 'bold', color: config.color }}>
            {config.titleVi}
          </Text>
          <Text style={{ fontSize: 14, color: '#6b7280', marginTop: 2 }}>
            {config.messageVi}
          </Text>
        </View>
      </View>

      {/* Confidence */}
      <View style={{ marginBottom: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
          <Text style={{ fontSize: 14, color: '#374151', fontWeight: '600' }}>
            Độ Tin Cậy
          </Text>
          <Text style={{ fontSize: 14, color: config.color, fontWeight: 'bold' }}>
            {confidence}%
          </Text>
        </View>
        {/* Progress bar */}
        <View
          style={{
            height: 8,
            backgroundColor: '#e5e7eb',
            borderRadius: 4,
            overflow: 'hidden',
          }}
        >
          <View
            style={{
              width: `${confidence}%`,
              height: '100%',
              backgroundColor: config.color,
            }}
          />
        </View>
      </View>

      {/* Details */}
      {details && (
        <View
          style={{
            backgroundColor: '#f9fafb',
            borderRadius: 8,
            padding: 12,
          }}
        >
          <Text style={{ fontSize: 12, color: '#6b7280', lineHeight: 18 }}>
            {details}
          </Text>
        </View>
      )}

      {/* Analysis breakdown */}
      <View style={{ marginTop: 16 }}>
        <Text style={{ fontSize: 12, fontWeight: '600', color: '#374151', marginBottom: 8 }}>
          Phân Tích:
        </Text>
        {[
          { label: 'Visual Quality', value: status === 'verified' ? 95 : status === 'suspicious' ? 70 : 45 },
          { label: 'Pattern Match', value: status === 'verified' ? 92 : status === 'suspicious' ? 65 : 30 },
          { label: 'Market Data', value: status === 'verified' ? 88 : status === 'suspicious' ? 75 : 50 },
        ].map((item, i) => (
          <View key={i} style={{ marginBottom: 8 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
              <Text style={{ fontSize: 11, color: '#6b7280' }}>{item.label}</Text>
              <Text style={{ fontSize: 11, color: '#374151', fontWeight: '600' }}>
                {item.value}%
              </Text>
            </View>
            <View style={{ height: 4, backgroundColor: '#e5e7eb', borderRadius: 2 }}>
              <View
                style={{
                  width: `${item.value}%`,
                  height: '100%',
                  backgroundColor: config.color,
                  borderRadius: 2,
                }}
              />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};
