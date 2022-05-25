import { Drawer, DrawerGroup, DrawerItem, Icon } from "@ui-kitten/components";
import React from "react";

const ProfileIcon = (props) => <Icon {...props} name="profile"></Icon>;

export const DrawerGroupScheme = () => {
  const [selectedIndex, setSelectedIndex] = React.useState(null);

  return (
    <Drawer
      selectedIndex={selectedIndex}
      onSelect={(index) => setSelectedIndex(index)}
    >
      <DrawerItem title={"Home"} accessoryLeft={ProfileIcon} />
      <DrawerGroup title={"Management"} accessoryLeft={ProfileIcon}>
        <DrawerItem title={"Drivers"} />
        <DrawerItem title={"Operators"} />
        <DrawerItem title={"Routes"} />
        <DrawerItem title={"Companies"} />
      </DrawerGroup>
      <DrawerItem title={"Logout"}></DrawerItem>
    </Drawer>
  );
};
