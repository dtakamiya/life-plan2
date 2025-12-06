import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 金額を日本円形式でフォーマット
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY',
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * 金額を万円単位でフォーマット
 */
export function formatInManYen(value: number): string {
  const manYen = value / 10000;
  if (manYen >= 10000) {
    return `${(manYen / 10000).toFixed(1)}億円`;
  }
  return `${manYen.toLocaleString()}万円`;
}

/**
 * 数値を3桁区切りでフォーマット
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('ja-JP').format(value);
}

/**
 * パーセンテージをフォーマット
 */
export function formatPercent(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * 年齢から西暦年を計算
 */
export function ageToYear(age: number, currentAge: number, currentYear: number = new Date().getFullYear()): number {
  return currentYear + (age - currentAge);
}

/**
 * 西暦年から年齢を計算
 */
export function yearToAge(year: number, birthYear: number): number {
  return year - birthYear;
}

/**
 * 入力値を数値に変換（空文字は0）
 */
export function parseNumberInput(value: string): number {
  const parsed = parseInt(value.replace(/,/g, ''), 10);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * リスクレベルに応じた色を返す
 */
export function getRiskColor(level: 'low' | 'medium' | 'high'): string {
  switch (level) {
    case 'low':
      return 'text-green-600';
    case 'medium':
      return 'text-yellow-600';
    case 'high':
      return 'text-red-600';
    default:
      return 'text-gray-600';
  }
}

/**
 * リスクレベルに応じた背景色を返す
 */
export function getRiskBgColor(level: 'low' | 'medium' | 'high'): string {
  switch (level) {
    case 'low':
      return 'bg-green-100';
    case 'medium':
      return 'bg-yellow-100';
    case 'high':
      return 'bg-red-100';
    default:
      return 'bg-gray-100';
  }
}
