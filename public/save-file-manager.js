Storage.prototype.setItem = new Proxy(Storage.prototype.setItem, {
  apply(target, thisArg, argumentList) {
    const event = new StorageEvent('storage', {
      key: argumentList[0],
      oldValue: thisArg.getItem(argumentList[0]),
      newValue: argumentList[1],
      storageArea: thisArg
    });
    window.dispatchEvent(event);
    return Reflect.apply(target, thisArg, argumentList);
  },
});

Storage.prototype.removeItem = new Proxy(Storage.prototype.removeItem, {
  apply(target, thisArg, argumentList) {
    const event = new StorageEvent('storage', {
      key: argumentList[0],
      oldValue: thisArg.getItem(argumentList[0]),
      newValue: undefined,
      storageArea: thisArg
    });
    window.dispatchEvent(event);
    return Reflect.apply(target, thisArg, argumentList);
  },
});

Storage.prototype.clear = new Proxy(Storage.prototype.clear, {
  apply(target, thisArg, argumentList) {
    const event = new StorageEvent('storage', {
      key: '__all__',
      storageArea: thisArg
    });
    window.dispatchEvent(event);
    return Reflect.apply(target, thisArg, argumentList);
  },
});

const saveFileKey = 'goobooSavefile';
const getSaveFile = () => fetch('/save')
  .then(res => res.text())
  .then(save => {
    if (save) {
      const currentSave = localStorage.getItem(saveFileKey);
      if (save !== currentSave) {
        localStorage.setItem(saveFileKey, save);
        window.location.reload();
      }
    }
  })
  .catch(err => console.error(err));

const updateSaveFile = () => fetch(
    '/save', 
    {
      method: 'POST',
      body: localStorage.getItem(saveFileKey)
    }
  )
  .catch(err => console.error(err));


window.onload = getSaveFile;

window.onstorage = ({ key, newValue, oldValue, storageArea }) => {
  if (key === saveFileKey && newValue !== oldValue) {
    updateSaveFile();
  }
};

window.onbeforeunload = () => {
  updateSaveFile();
};