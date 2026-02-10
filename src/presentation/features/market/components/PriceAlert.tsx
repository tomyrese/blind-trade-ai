// Price Alert UI Component
import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, Modal } from 'react-native';
import { Bell, X } from 'lucide-react-native';

interface PriceAlertProps {
  symbol: string;
  currentPrice: number;
}

export const PriceAlert: React.FC<PriceAlertProps> = ({ symbol, currentPrice }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [targetPrice, setTargetPrice] = useState('');

  const handleSetAlert = () => {
    // In real app, save to backend or local storage
    console.log(`Alert set for ${symbol} at $${targetPrice}`);
    setIsVisible(false);
    setTargetPrice('');
  };

  return (
    <>
      <Pressable
        onPress={() => setIsVisible(true)}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: '#3b82f6',
          paddingHorizontal: 16,
          paddingVertical: 10,
          borderRadius: 8,
          margin: 16,
        }}
      >
        <Bell size={18} color="#ffffff" />
        <Text style={{ color: '#ffffff', fontWeight: '600', marginLeft: 8 }}>
          Đặt Cảnh Báo Giá
        </Text>
      </Pressable>

      <Modal
        visible={isVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: '#ffffff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 }}>
            {/* Header */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#111827' }}>
                Đặt Cảnh Báo Giá
              </Text>
              <Pressable onPress={() => setIsVisible(false)}>
                <X size={24} color="#6b7280" />
              </Pressable>
            </View>

            {/* Current Price */}
            <View style={{ backgroundColor: '#f3f4f6', padding: 12, borderRadius: 8, marginBottom: 16 }}>
              <Text style={{ fontSize: 12, color: '#6b7280' }}>Giá Hiện Tại</Text>
              <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#111827', marginTop: 4 }}>
                {symbol} ${currentPrice.toLocaleString()}
              </Text>
            </View>

            {/* Target Price Input */}
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 }}>
              Giá Mục Tiêu
            </Text>
            <TextInput
              value={targetPrice}
              onChangeText={setTargetPrice}
              placeholder="Nhập giá mục tiêu"
              keyboardType="decimal-pad"
              style={{
                borderWidth: 1,
                borderColor: '#d1d5db',
                borderRadius: 8,
                padding: 12,
                fontSize: 16,
                marginBottom: 20,
              }}
            />

            {/* Action Buttons */}
            <Pressable
              onPress={handleSetAlert}
              style={{
                backgroundColor: '#3b82f6',
                paddingVertical: 14,
                borderRadius: 8,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: 'bold' }}>
                Xác Nhận
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
};
