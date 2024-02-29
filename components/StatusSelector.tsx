'use client'

import React, { RefObject, useEffect, useRef, useState } from 'react';
import '@styles/css/StatusSelector.css'

interface ItemType {
    name: "All" | "Upcoming" | "Ongoing" | "Completed";
    slug: "one" | "two" | "three" | "four"
}

const MenuItems: ItemType[] = [
    {
        name: "All",
        slug: "one"
    },
    {
      name: "Upcoming",
      slug: "two"
    },
    {
      name: "Ongoing",
      slug: "three"
    },
    {
      name: "Completed",
      slug: "four"
    },
];
  
  const MenuItem = (props: { item: any; selected?: boolean | null; onItemSelect: any; }) => {
    const { item, selected = false, onItemSelect } = props;
  
  
    return (
      <div
        key={item.slug}
        className={`TripTypeBtns-item ${selected ? "TripTypeBtns-item--selected" : ""}`}
        data-slug={item.slug}
        onClick={() => {
          onItemSelect(item);
        }}
      >
        {item.name}
      </div>
    );
  };
  
  const StatusSelector = (props: { onSelectedItem: any; initialItemSlug?: null | undefined; }) => {
    const { onSelectedItem, initialItemSlug = null } = props;
    const [selectedItem, setSelectedItem] = useState<ItemType | null>(null);
    const menuItemsRef = useRef<HTMLDivElement | null>(null);
    const selectedItemRef =
      menuItemsRef.current && selectedItem
        ? menuItemsRef!.current!.querySelector(`[data-slug=${selectedItem.slug}]`) as HTMLDivElement
        : null;
  
    const calculateDashPosition = (element: HTMLDivElement, dashWidth: number) => {
      return element.offsetLeft + element.offsetWidth / 2 - dashWidth / 2;
    };
  
    const calculateDashWidth = (element: HTMLDivElement) => {
      return element.offsetWidth;
    };
  
    const dashWidth = selectedItemRef ? calculateDashWidth(selectedItemRef) : 0;
  
    const dashPosition = selectedItemRef
      ? calculateDashPosition(selectedItemRef, dashWidth)
      : 0;
  
    const selectItem = (item: ItemType) => {
      setSelectedItem(item);
      onSelectedItem(item);
    };
  
    let scrollVal: number = 0;
    const fx = () => {
  
      let curr = document.querySelector('.AllTrips')?.scrollTop;
  
      if ( curr && curr > scrollVal) {
        scrollVal = curr;
        if (document.querySelector('.AllTrips') && document.querySelector('.AllTrips')?.scrollTop! > 100) {
  
          document.querySelector('.pro_sticky_header')?.classList.add('hideBar')
        }
      } else {
        scrollVal = curr!;
        document.querySelector('.pro_sticky_header')?.classList.remove('hideBar')
      }
  
    }

    const fx2 = (e: MouseEvent) => {
      let y = e.clientY;
      
      if(y <= document.querySelector('.pro_sticky_header')?.clientHeight! && document.querySelector('.pro_sticky_header')?.classList.contains('hideBar'))
      {
        document.querySelector('.pro_sticky_header')?.classList.remove('hideBar');
      }
  
    }
  
    useEffect(() => {
      const initialItem = initialItemSlug
        ? MenuItems.find((item) => item.slug === initialItemSlug)
        : MenuItems[0];
      if(initialItem) setSelectedItem(initialItem);
      document.querySelector('.AllTrips__heading')?.scrollIntoView(false);
  
      document.querySelector('.AllTrips')?.addEventListener("scroll", fx);
      document.querySelector('.AllTrips')?.addEventListener("mousemove", fx2 as EventListener);
    }, []);
  
    const renderItems = MenuItems.map((item, id) => (
      <MenuItem
        key={id}
        item={item}
        selected={selectedItem && selectedItem.slug === item.slug}
        onItemSelect={selectItem}
      />
    ));
  
    return (
      <div className="TripTypeBtns">
        <div className="TripTypeBtns-items" ref={menuItemsRef}>
          {renderItems}
          <div
            className="TripTypeBtns-underline"
            style={{
              width: dashWidth,
              transform: `translate3d(${dashPosition}px, 0 , 0)`
            }}
          />
        </div>
      </div>
    );
  };

export default StatusSelector