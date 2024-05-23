import { createTheme } from '@rneui/themed';

export const defaultColors = {
  primary: '#f2f2f2',
  primaryLight: 'red',
  bgColor: '#ffffff',
  bgColor1: 'rgba(242, 244, 246, 1)',
  primaryColor: '#5D42FF',

  bg1: '#ffffff',
  bg2: '#FEF6E7',
  bg3: '#F3E4E4',
  bg4: '#F7F8F9',
  bg5: '#5D42FF',
  bg6: '#F5F6F7',
  bg7: '#DEE2E8',
  bg8: '#00B75F',
  bg9: '#E7F0FC',
  bg10: '#F3E4E4',
  bg11: '#FEF6E7',
  bg12: '#BDD2FB',
  bg13: '#0075FF',
  bg14: '#CEDDFC',
  bg15: 'rgba(104, 170, 253, .2)',
  bg16: '#C5CBD5',
  bg17: '#EA4F45',
  bg18: '#F0F1F4',
  bg19: '#000000',
  bg20: '#515A62',
  bg21: '#FDEDEC',
  bg22: '#F6A037',
  bg23: '#FBD09B',
  bg24: '#E79634',
  bg25: '#DAE8FA',
  bg26: '#E6E8ED',
  bg27: 'rgba(234, 79, 69, .1)',
  bg28: '#161630',
  bg29: '#111124',
  bg30: '#979AA1',
  bg31: '#25272A',
  bg32: '#EBEBEC',
  bg33: '#FFF4E8',

  font1: '#464B53',
  font2: 'white',
  font3: '#515A62',
  font4: '#5D42FF',
  font5: '#101114',
  font6: '#FAAD14',
  font7: '#B6BABF',
  font8: '#252525',
  font9: '#000000',
  font10: '#00B75F',
  font11: '#979AA1',
  font12: '#F53F3F',
  font13: '#EA4F45',
  font14: '#FFE4C5',
  font15: '#C6A05A',
  font16: '#25272A',
  font17: '#5D42FF',
  font18: '#55585E',
  font19: '#55585E',
  font20: '#F53F3F',
  font21: '#C0C3C7',
  font22: '#B2B0FF',

  white: '#ffffff',
  black: '#000000',

  icon1: '#515A62',
  icon2: '#ffffff',
  icon3: '#333333',
  icon4: '#757A85',
  icon5: '#55585E',

  border1: '#C5CBD5',
  border2: '#F7F8F9',
  border3: '#5D42FF',
  border4: '#F0F2F5',
  border5: '#F2F4F6',
  border6: '#DEE2E8',
  border7: '#C14247',
  border8: '#FFD4A2',
  border10: '#DCDEE1',

  error: '#F53F3F',
  error1: '#FF4D4F',

  shadow1: '#4D4E59',
};

export const lightModeColors = {
  brandTouched: '#5137EE',
  brandNormal: '#5D42FF',
  brandDisable: '#B2B0FF',
  brandLight: '#EFECFF',

  functionalGreenDefault: '#00B75F',
  functionalGreenDisable: '#99E2BF',
  functionalGreenLight: '#EAF9EF',

  functionalYellowDefault: '#FF9417',
  functionalYellowDisable: '#FFD4A2',
  functionalYellowLight: '#FFF4E8',

  functionalRedDefault: '#F53F3F',
  functionalRedDisable: '#FCBCBC',
  functionalRedLight: '#FFEEEE',

  primaryTextColor: '#101114',
  secondaryTextColor: '#101114',
};

export const AELFColors = {
  AELF: '#266CD3',
  tDVV: '#4B60DD',
};

export const myTheme = createTheme({
  lightColors: defaultColors,
  darkColors: defaultColors,
  mode: 'light',
});
