const { generateID } = require("./utils");

module.exports = (module) => {


  const map = (module) => {
    return Object.assign(
      {},
      module,
      {
        version: "0.0.4",
        children: module.children.map(mapModuleChild)
      }
    )
  };

  const mapModuleChild = (child) => {

    const style = {
      left: child.metadata.bounds.left,
      top: child.metadata.bounds.top,
      width: child.metadata.bounds.right - child.metadata.bounds.left,
      height: child.metadata.bounds.bottom - child.metadata.bounds.top,
    };

    const artboard = {
      id: generateID(),
      name: "artboard",
      is: "div",
      style,
      attributes: {},
      metadata: {},
      children: [Object.assign({}, child, {
        metadata: Object.assign({}, child.metadata, {
          bounds: undefined
        })
      })]
    };

    return artboard;
  };

  return map(module);
}