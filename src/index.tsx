'use client';

import * as React from 'react';
import { classNames } from './class-names';
import { useClickOutside } from './use-click-outside';

import './styles.css';

interface NestedProps {
  list: NestedNodeType[];
  label?: string;
  placeholder?: string;
  selectedListValues?: (items: string[]) => void;
  selectedList?: (value: NestedNodeType[]) => void;
  required?: boolean;
  dir?: 'ltr' | 'rtl';
  showModal?: boolean;
  showCount?: boolean;
  emptyMessage?: string;
  searchInputProps?: React.InputHTMLAttributes<HTMLInputElement>;
}

export interface NestedNodeType {
  title: string;
  value: string;
  isChecked?: boolean;
  show?: boolean;
  child: NestedNodeType[];
}

let mainList: NestedNodeType[] = [];
export const NestedCheckbox = ({
  list,
  label,
  placeholder,
  selectedList,
  selectedListValues,
  required,
  dir,
  showCount,
  showModal,
  emptyMessage,
  searchInputProps,
}: NestedProps) => {
  const [showingList, setShowingList] = React.useState<NestedNodeType[] | undefined>(list ?? []);
  const [forceRender, setForceRender] = React.useState(false);
  const [isFocusing, setIsFocusing] = React.useState(false);
  const [searchInput, setSearchInput] = React.useState('');
  const [modal, setModal] = React.useState(false);

  const optionsRef = React.useRef<HTMLDivElement>(null);
  const modalRef = React.useRef<HTMLDivElement>(null);

  useClickOutside(optionsRef, () => {
    setSearchInput('');
    setIsFocusing(false);
  });

  useClickOutside(modalRef, () => {
    setModal(false);
  });

  React.useEffect(() => {
    selectedList?.(JSON.parse(JSON.stringify(mainList)));
    selectedListValues?.(getAllSelectedValues(JSON.parse(JSON.stringify(mainList)), []));
  }, [forceRender]);

  React.useEffect(() => {
    if (list) {
      mainList = list;
      setShowingList(list);
    }
    return () => {
      mainList = [];
    };
  }, [list]);

  return (
    <div className="nested-checkbox" ref={optionsRef} dir={dir}>
      <label className="nested-checkbox__label">
        <p>
          {label}
          {required && <span className="nested-checkbox__label--required">*</span>}
        </p>
        <input
          type="text"
          value={searchInput}
          onChange={(e) => {
            setSearchInput(e.currentTarget.value);
            mainList = iterateNodes(mainList, e.currentTarget.value);
            setShowingList(mainList);
          }}
          placeholder={placeholder}
          onFocus={() => {
            if (!isFocusing) setIsFocusing(true);
          }}
          onClick={() => {
            if (!isFocusing) setIsFocusing(true);
          }}
          className="nested-checkbox__label--input"
          {...searchInputProps}
        />
      </label>
      {showCount && (
        <div
          className={'nested-checkbox__count'}
          style={
            showModal
              ? {
                  cursor: 'pointer',
                }
              : {}
          }
          onClick={() => {
            if (showModal) {
              setModal(true);
            }
          }}
        >
          <span>{countProcess(showingList ?? [])}</span>
        </div>
      )}
      <div
        className="nested-checkbox__wrapper"
        style={
          isFocusing
            ? {
                borderWidth: '1px',
              }
            : {}
        }
      >
        <div
          className={classNames('nested-checkbox__container', {
            show: isFocusing ? '' : 'nested-checkbox__container--hide',
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
            <p className="nested-checkbox__container--no-data">{emptyMessage || 'No data to select'}</p>
          )}
        </div>
      </div>

      {showModal && modal && (
        <div
          className={classNames('nested-checkbox__modal', {
            show: modal ? 'nested-checkbox__modal--open' : '',
          })}
        >
          <div ref={modalRef} className={'nested-checkbox__modal__container'}>
            <div className={'nested-checkbox__modal__container--close'}>
              <button
                type="button"
                onClick={() => {
                  setModal(false);
                }}
              >
                <img
                  src={
                    'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz48IS0tIFVwbG9hZGVkIHRvOiBTVkcgUmVwbywgd3d3LnN2Z3JlcG8uY29tLCBHZW5lcmF0b3I6IFNWRyBSZXBvIE1peGVyIFRvb2xzIC0tPg0KPHN2ZyB3aWR0aD0iODAwcHgiIGhlaWdodD0iODAwcHgiIHZpZXdCb3g9Ii0wLjUgMCAyNSAyNSIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4NCjxwYXRoIGQ9Ik0zIDIxLjMyTDIxIDMuMzIwMDEiIHN0cm9rZT0iIzAwMDAwMCIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPg0KPHBhdGggZD0iTTMgMy4zMjAwMUwyMSAyMS4zMiIgc3Ryb2tlPSIjMDAwMDAwIiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+DQo8L3N2Zz4='
                  }
                  alt=""
                  width={16}
                />
              </button>
            </div>
            <div>
              <ModalBody list={filterSelectedItems(JSON.parse(JSON.stringify(showingList)) ?? [])} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * each Node affects their parent and child Nodes
 * @param param ({ NestedNodeType[], boolean, NestedNodeType, SetStateAction })
 * @returns JSX Element
 */
const Node = ({
  list,
  open,
  parentForceRender,
  mainList,
  currentNodeIndex,
}: Pick<NestedProps, 'list'> & {
  open?: boolean;
  parentForceRender: React.Dispatch<React.SetStateAction<boolean>>;
  mainList: NestedNodeType[];
  currentNodeIndex: number[];
}) => {
  const [forceRender, setForceRender] = React.useState(false);

  React.useEffect(() => {
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
            className={classNames('nested-checkbox__node', {
              open: open ? 'nested-checkbox__node--show' : 'nested-checkbox__node--hidden',
            })}
          >
            <div className="nested-checkbox__node__element">
              <img
                src={
                  'data:image/svg+xml;base64, PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgaWQ9ImFycm93Ij48cGF0aCBkPSJNMTYuNjgyIDE5LjY3NGMuMDEtLjAxMi4wMTQtLjAyOC4wMjQtLjA0bDYuOTgyLTcuNzE0Yy4zOS0uNDM0LjM5LTEuMTM4IDAtMS41NzItLjAwNC0uMDA0LS4wMDgtLjAwNi0uMDEyLS4wMDhhLjkzNi45MzYgMCAwIDAtLjcxMi0uMzRIOC45OThhLjk0OC45NDggMCAwIDAtLjcyMi4zNTJsLS4wMDQtLjAwNGExLjIwMiAxLjIwMiAwIDAgMCAwIDEuNTcybDYuOTk4IDcuNzU0YS45MjguOTI4IDAgMCAwIDEuNDEyIDB6Ij48L3BhdGg+PC9zdmc+'
                }
                alt="arrow"
                className={classNames('nested-checkbox__node__element--icon', {
                  open: item.show ? 'nested-checkbox__node__element--icon--active' : '',
                  haveChild: item.child?.length ? '' : 'nested-checkbox__node__element--icon--light',
                })}
                onClick={() => {
                  findNodeWithMatrixIndex(mainList, [...currentNodeIndex, i], (node) => {
                    node.show = !node.show;
                  });
                  parentForceRender((pre) => !pre);
                }}
              />
              <label className="nested-checkbox__node__element__checkbox">
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
                  className="nested-checkbox__node__element__checkbox--input"
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

const ModalBody = ({ list }: { list?: NestedNodeType[] }) => {
  return (
    <>
      {list?.map((item) => {
        return (
          <React.Fragment key={item.value}>
            <p>{item.title}</p>
            {item.child.length ? (
              <div>
                <ModalBody list={item.child} />
              </div>
            ) : (
              <></>
            )}
          </React.Fragment>
        );
      })}
    </>
  );
};

export function areAllChildrenChecked(node: NestedNodeType): boolean {
  return node.child.every((child) => {
    if (child.child.length) {
      return areAllChildrenChecked(child);
    }
    return child.isChecked;
  });
}

function updateParentCheckedState(node: NestedNodeType): boolean {
  node.isChecked = areAllChildrenChecked(node);
  return node.isChecked;
}

const setIsChecked = (item: NestedNodeType[], checked: boolean): NestedNodeType[] => {
  return item.map((el): NestedNodeType => {
    if (el.child.length) {
      return {
        ...el,
        isChecked: checked,
        child: setIsChecked(el.child, checked),
      };
    }
    return {
      ...el,
      isChecked: checked,
    };
  });
};

// ************************************************
const checkNode = (node: NestedNodeType, search: string) => {
  if (node.title.includes(search)) node.show = true;
  else node.show = false;

  node.child.forEach((child) => {
    checkNode(child, search);
  });
};

const isChildInclude = (list: NestedNodeType[]): boolean => {
  return list.some((child) => child.show || isChildInclude(child.child));
};

const iterateNodes = (list: NestedNodeType[], search: string) => {
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

const handleChildChecked = (item: NestedNodeType, checked: boolean) => {
  item.isChecked = checked;
  if (item.child.length) {
    item.child = setIsChecked(item.child, checked);
  }
};

export const findNodeWithMatrixIndex = (
  list: NestedNodeType[],
  targetList: number[],
  callback: (node: NestedNodeType) => void,
  currentIndex = 0,
): NestedNodeType[] => {
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

const getAllSelectedValues = (list: NestedNodeType[], output: string[]): string[] => {
  for (const item of list) {
    if (item) {
      if (item.isChecked) output.push(item.value);
      if (item.child.length) getAllSelectedValues(item?.child, output);
    }
  }
  return [...new Set(output)];
};

function counter(node: NestedNodeType, count = 0): number {
  node.child.forEach((child) => {
    if (child.child.length) {
      count = counter(child, count);
    }
    if (child.isChecked) {
      count = count + 1;
    }
    return count;
  });
  return count;
}

const countProcess = (list: NestedNodeType[]): number => {
  let count = 0;
  for (let index = 0; index < list.length; index++) {
    count = count + counter(list[index]);
    if (list[index].isChecked) {
      count = count + 1;
    }
  }
  return count;
};

const filterSelectedItems = (list: NestedNodeType[]): NestedNodeType[] => {
  return list.reduce((acc, el) => {
    const filteredChild = filterSelectedItems(el.child);
    if (filteredChild.length > 0 || el.isChecked) {
      acc.push({ ...el, child: filteredChild });
    }
    return acc;
  }, [] as NestedNodeType[]);
};
