import * as React from 'react';
import { Dispatch, FC, SetStateAction, useEffect, useRef, useState } from 'react';
import { classNames } from './class-names';
import { useClickOutside } from './use-click-outside';

const flatMapDeep = (members: any) => {
  let children = [];
  const flattenMembers = members.map((m) => {
    if (m.children && m.children.length) {
      children = [...children, ...m.children];
    }
    return m;
  });

  return flattenMembers.concat(children.length ? flatMapDeep(children) : children);
};

interface ITreeSelect extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  list: ITreeSelectNode[];
  label?: string;
  placeholder?: string;
  selectedListValues?: (items: string[]) => void;
  selectedList?: (value: ITreeSelectNode[]) => void;
  required?: boolean;
}

export interface ITreeSelectNode {
  title: string;
  value: string;
  isChecked?: boolean;
  open?: boolean;
  show?: boolean;
  isSelected?: boolean;
  child: ITreeSelectNode[];
}

let mainList: ITreeSelectNode[] = [];
export const NestedCheckbox: FC<ITreeSelect> = ({
  list,
  label,
  placeholder,
  selectedList,
  selectedListValues,
  required,
  ...props
}) => {
  const [showingList, setShowingList] = useState<ITreeSelectNode[] | undefined>(list ?? []);
  const [forceRender, setForceRender] = useState(false);
  const [isFocusing, setIsFocusing] = useState(false);
  const [searchInput, setSearchInput] = useState('');

  const optionsRef = useRef<HTMLDivElement>(null);

  // console.log(countProcess(showingList ?? []));

  useClickOutside(optionsRef, () => {
    setSearchInput('');
    // setShowingList(cloneDeep(merge(mainList, showingList)));
    // setMainList(cloneDeep(merge(mainList, showingList)));
    setIsFocusing(false);
  });

  useEffect(() => {
    selectedList?.(JSON.parse(JSON.stringify(mainList)));
    selectedListValues?.(getAllSelectedValues(JSON.parse(JSON.stringify(mainList)), []));
  }, [forceRender, isFocusing]);

  useEffect(() => {
    if (list) {
      mainList = list;
      setShowingList(list);
    }
    return () => {
      mainList = [];
    };
  }, [list]);

  return (
    <div {...props} className="treeSelectCheckable" ref={optionsRef}>
      <label className="treeSelectCheckable_label">
        <p>
          {label}
          {required && <span className="treeSelectCheckable_label__required">*</span>}
        </p>
        <input
          type="text"
          value={searchInput}
          onChange={(e) => {
            setSearchInput(e.currentTarget.value);
            mainList = iterateNodes(mainList, e.currentTarget.value);
            setShowingList(mainList);
          }}
          dir="auto"
          placeholder={placeholder}
          onFocus={() => {
            if (!isFocusing) setIsFocusing(true);
          }}
          onClick={() => {
            if (!isFocusing) setIsFocusing(true);
          }}
        />
      </label>
      <div
        style={{
          overflowY: 'auto',
          maxHeight: '300px',
          borderRadius: '15px',
          position: 'absolute',
          top: '100%',
          width: '100%',
          zIndex: 100,
          marginTop: '0.4rem',
          border: isFocusing ? '1px solid rgba(176, 190, 197, 0.6)' : 'none',
        }}
      >
        <div
          className={classNames('treeSelectCheckable_box', {
            show: isFocusing ? '' : 'treeSelectCheckable_boxHide',
          })}
        >
          {showingList?.length !== 0 ? (
            <Node
              list={showingList ?? []}
              open={true}
              mainList={mainList}
              parentForceRender={setForceRender}
              currentNodeIndex={[]}
            />
          ) : (
            <p
              style={{
                textAlign: 'center',
                margin: '0',
                fontSize: '12px',
                fontWeight: 600,
                color: '#cfc5c5',
              }}
            >
              بدون داده ای برای انتخاب
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

const filterSelectedItems = (list: ITreeSelectNode[]): ITreeSelectNode[] => {
  return list.reduce((acc, el) => {
    const filteredChild = filterSelectedItems(el.child);
    if (filteredChild.length > 0 || el.isChecked) {
      acc.push({ ...el, child: filteredChild });
    }
    return acc;
  }, [] as ITreeSelectNode[]);
};

const countProcess = (list: ITreeSelectNode[]): any[] => {
  return flatMapDeep(list).filter((item: ITreeSelectNode) => item.isChecked);
};

const flatten = function (item: any): any {
  return [item, flatMapDeep(item.child)];
};

/**
 * each Node affects their parent and child Nodes
 * @param param ({ ITreeSelectNode[], boolean, ITreeSelectNode, SetStateAction })
 * @returns JSX Element
 */
const Node = ({
  list,
  open,
  parentForceRender,
  mainList,
  currentNodeIndex,
}: Pick<ITreeSelect, 'list'> & {
  open?: boolean;
  parentForceRender: Dispatch<SetStateAction<boolean>>;
  mainList: ITreeSelectNode[];
  currentNodeIndex: number[];
}) => {
  const [forceRender, setForceRender] = useState(false);

  useEffect(() => {
    findNodeWithMatrixIndex(mainList, currentNodeIndex, (parentNode) => {
      if (parentNode.child.length) {
        updateParentCheckedState(parentNode);
      }
    });
    parentForceRender((pre) => !pre);
  }, [forceRender]);

  return (
    <>
      {list?.map((item, i) => {
        return (
          <div
            key={item.value}
            className={classNames('nodeItem', {
              open: open ? 'showItem' : 'hidden',
            })}
          >
            <div className="nodeItem_element">
              <i
                className={classNames('icon-caret-down', {
                  open: item.show ? 'nodeItem_element_icon_active' : 'nodeItem_element_icon',
                  haveChild: item.child?.length ? '' : 'text-light',
                })}
                onClick={() => {
                  findNodeWithMatrixIndex(mainList, [...currentNodeIndex, i], (node) => {
                    node.show = !node.show;
                  });
                  parentForceRender((pre) => !pre);
                }}
              />
              <label>
                <input
                  type="checkbox"
                  name={item.value}
                  onChange={(e) => {
                    findNodeWithMatrixIndex(mainList, [...currentNodeIndex, i], (node) => {
                      handleChildChecked(node, e.currentTarget.checked);
                    });
                    setForceRender((pre) => !pre);
                  }}
                  checked={item.isChecked}
                  className="custom-control-input pointer"
                />
                <p>{item.title}</p>
              </label>
            </div>
            <Node
              list={item.child}
              open={item.child?.length !== 0 && item.show}
              parentForceRender={setForceRender}
              mainList={mainList}
              currentNodeIndex={[...currentNodeIndex, i]}
            />
          </div>
        );
      })}
    </>
  );
};

export function areAllChildrenChecked(node: ITreeSelectNode): boolean {
  return node.child.every((child) => {
    if (child.child.length) {
      return areAllChildrenChecked(child);
    }
    return child.isChecked;
  });
}

function updateParentCheckedState(node: ITreeSelectNode): boolean {
  node.isChecked = areAllChildrenChecked(node);
  node.isSelected = undefined;
  return node.isChecked;
}

const setIsChecked = (item: ITreeSelectNode[], checked: boolean): ITreeSelectNode[] => {
  return item.map((el): ITreeSelectNode => {
    if (el.child.length) {
      return {
        ...el,
        isSelected: undefined,
        isChecked: checked,
        child: setIsChecked(el.child, checked),
      };
    }
    return {
      ...el,
      isSelected: undefined,
      isChecked: checked,
    };
  });
};

// ************************************************
const checkNode = (node: ITreeSelectNode, search: string) => {
  if (node.title.includes(search)) node.show = true;
  else node.show = false;

  node.child.forEach((child) => {
    checkNode(child, search);
  });
};

const isChildInclude = (list: ITreeSelectNode[]): boolean => {
  return list.some((child) => child.show || isChildInclude(child.child));
};

const iterateNodes = (list: ITreeSelectNode[], search: string) => {
  const newList = JSON.parse(JSON.stringify(list));

  for (const node of newList) {
    checkNode(node, search);
    if (isChildInclude(node.child)) node.show = true;
    else node.show = false;
    node.child = iterateNodes(node.child, search);
  }

  return newList;
};

// ************************************************

const handleChildChecked = (item: ITreeSelectNode, checked: boolean) => {
  item.isChecked = checked;
  item.isSelected = checked;
  if (item.child.length) {
    item.child = setIsChecked(item.child, checked);
  }
};

export const findNodeWithMatrixIndex = (
  list: ITreeSelectNode[],
  targetList: number[],
  callback: (node: ITreeSelectNode) => void,
  currentIndex = 0,
): ITreeSelectNode[] => {
  if (!targetList.length) {
    if (list[0]) callback(list[0]);
    return list;
  }
  if (currentIndex === targetList.length - 1) {
    if (list?.[targetList?.[currentIndex]]) callback(list?.[targetList?.[currentIndex]]);
    return list;
  }
  return findNodeWithMatrixIndex(list?.[targetList?.[currentIndex]]?.child, targetList, callback, currentIndex + 1);
};

const getAllSelectedValues = (list: ITreeSelectNode[], output: string[]): string[] => {
  for (const item of list) {
    if (item) {
      if (item.isChecked) output.push(item.value);
      if (item.child.length) getAllSelectedValues(item?.child, output);
    }
  }
  return [...new Set(output)];
};
