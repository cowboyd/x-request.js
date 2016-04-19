export default function assign(object, ...objects) {
  for (let i = 0; i < objects.length; i++) {
    let hash = objects[i];
    for (let key in hash) {
      object[key] = hash[key];
    }
  }
  return object;
}
