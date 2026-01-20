export const declineRoomWord = (count: number): string => {
  if (count % 100 >= 11 && count % 100 <= 14) {
    return 'комнат';
  }
  switch (count % 10) {
    case 1: return 'комната';
    case 2:
    case 3:
    case 4: return 'комнаты';
    default: return 'комнат';
  }
};

export const declineSleepsWord = (count: number): string => {
  if (count % 100 >= 11 && count % 100 <= 14) {
    return 'спальных мест';
  }
  switch (count % 10) {
    case 1: return 'спальное место';
    case 2:
    case 3:
    case 4: return 'спальных места';
    default: return 'спальных мест';
  }
};

export const declineGuestWord = (count: number): string => {
  if (count % 100 >= 11 && count % 100 <= 14) {
    return 'гостей';
  }
  switch (count % 10) {
    case 1: return 'гость';
    case 2:
    case 3:
    case 4: return 'гостя';
    default: return 'гостей';
  }
};


export const declineKidsWord = (count: number): string => {
  if (count === 0) return 'детей';
  if (count === 1) return 'ребенок';
  if (count >= 2 && count <= 4) return 'ребенка';
  return 'детей';
};

export const declineNightsWord = (count: number): string => {
  if (count % 100 >= 11 && count % 100 <= 14) {
    return 'ночей';
  }
  switch (count % 10) {
    case 1: return 'ночь';
    case 2:
    case 3:
    case 4: return 'ночи';
    default: return 'ночей';
  }
};

export const declineAdultsWord = (count: number): string => {


  if (count % 10 === 1) return ' взрослый';
   return ' взрослых';

};