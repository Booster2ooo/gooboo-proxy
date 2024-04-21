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

let savingEnabled = true;
const saveFileKey = 'goobooSavefile';
const saveApiEndpoint = `${applicationPath}/save`;
const getSaveFile = () => fetch(saveApiEndpoint)
  .then(res => res.text())
  .then(save => {
    if (save) {
      const currentSave = localStorage.getItem(saveFileKey);
      if (save !== currentSave) {
        savingEnabled = false;
        localStorage.setItem(saveFileKey, save);
        window.location.reload();
      }
    }
  })
  .catch(err => console.error(err));
const updateSaveFile = async () => fetch(
  saveApiEndpoint, 
  {
    method: 'POST',
    body: localStorage.getItem(saveFileKey)
  }
)
.catch(err => console.error(err));


window.onload = getSaveFile;

window.onstorage = async ({ key, newValue, oldValue, storageArea }) => {
  if (savingEnabled && key === saveFileKey && newValue !== oldValue) {
    await updateSaveFile();
  }
};

window.onbeforeunload = async () => {
  if (savingEnabled) {
    const vue = document.getElementById('app').__vue__;
    const header = vue.$children.find(c => c.$vnode.tag.includes('v-app-bar'));
    const menu = header.$children.filter(c => c.$vnode.tag.includes('v-menu'))[1];
    const toggleBtn = menu.$children[0];
    toggleBtn.$el.dispatchEvent(new Event('mouseenter'));
    setTimeout(async () => {	
      const saveBtn = menu.$children[1].$children[0].$children[0].$el;
      saveBtn.click();
      await updateSaveFile();
    }, 100);
  }
};
