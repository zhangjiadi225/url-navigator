/*
 * @Author: jdzhang jdzhang@in-road.com
 * @Date: 2024-12-27 14:07:29
 * @LastEditors: jdzhang jdzhang@in-road.com
 * @LastEditTime: 2024-12-27 14:09:50
 * @FilePath: \url-navigator\src\app\test\index.js
 * @Description: 
 */
import { Faker, zh_CN } from '@faker-js/faker';
function organizationVaild(text) {
	return /[0-9A-HJ-NPQRTUWXY]{2}\d{6}[0-9A-HJ-NPQRTUWXY]{10}/.test(text)
}
function phoneValidType(txt) {
	return /^1[3456789]\d{9}$/.test(txt)
}
function idCardVerification(txt) {
	return /^[1-9]\d{5}(18|19|([23]\d))\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/.test(
		txt
	)
}
const customFaker = new Faker({
  locale: [zh_CN],
});

const generateUSCCode = () => {
  const managementDeptCode = customFaker.helpers.arrayElement(['1', '5']);
  const institutionCategoryCode = customFaker.string.numeric(1);
  const adminDivisionCode = customFaker.string.numeric(6);
  const entityIdentifierCode = customFaker.string.numeric(9);
  const baseCode = `${managementDeptCode}${institutionCategoryCode}${adminDivisionCode}${entityIdentifierCode}`;
  const checkDigit = calculateCheckDigit(baseCode);
  return `${baseCode}${checkDigit}`;
};
const generateValidUSCCode = () => {
  let code;
  do {
    code = generateUSCCode();
  } while (!organizationVaild(code));
  return code;
};

const calculateCheckDigit = (code) => {
  const weights = [1, 3, 9, 27, 19, 26, 16, 17, 20, 29, 25, 13, 8, 24, 10, 30, 28];
  const checkChars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let sum = 0;

  for (let i = 0; i < code.length; i++) {
    sum += parseInt(code[i], 36) * weights[i];
  }

  const mod = sum % 31;
  return checkChars[mod];
};

const generatePhoneNumber = () => {
  const secondDigit = customFaker.helpers.arrayElement(['3', '4', '5', '6', '7', '8', '9']);
  return `1${secondDigit}${customFaker.string.numeric(9)}`;
};

const generateRandomIdCard = () => {
  const areaCode = customFaker.string.numeric(6);
  const year = customFaker.number.int({ min: 1960, max: 2005 });
  const month = customFaker.number.int({ min: 1, max: 12 }).toString().padStart(2, '0');
  const day = customFaker.number.int({ min: 1, max: 28 }).toString().padStart(2, '0');
  const birthDate = `${year}${month}${day}`;
  const sequenceCode = customFaker.string.numeric(3);
  const baseCode = `${areaCode}${birthDate}${sequenceCode}`;
  const weights = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
  const checkCodes = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2'];

  let sum = 0;
  for (let i = 0; i < 17; i++) {
    sum += parseInt(baseCode[i]) * weights[i];
  }
  const checkCode = checkCodes[sum % 11];

  return `${baseCode}${checkCode}`;
};
const generateValidIdCard = () => {
  let idCard;
  do {
    idCard = generateRandomIdCard();
  } while (!idCardVerification(idCard));
  return idCard;
};
const testGeneratedData = () => {
  const errorArray = [];
  for (let i = 0; i < 100; i++) {
    const uscCode = generateValidUSCCode();
    const phoneNumber = generatePhoneNumber();
    const idCard = generateValidIdCard();
    if (!organizationVaild(uscCode) || !phoneValidType(phoneNumber) || !idCardVerification(idCard)) {
      errorArray.push({ uscCode, phoneNumber, idCard });
    }
  }
  console.log(errorArray);
};

testGeneratedData();