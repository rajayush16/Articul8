"use client";
import React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "./ui/sidebar";
import { Input } from "./ui/input";
import { BoxSelect } from "lucide-react";
import { blogCategories, useAppData } from "@/context/AppContext";

const SideBar = () => {
  const { debouncedQuery, category, setDebouncedQuery, setCategory } = useAppData();
  return (
    <Sidebar>
      <SidebarHeader className="bg-white text-2xl font-bold mt-5">
        Articul8
      </SidebarHeader>
      <SidebarContent className="bg-white">
        <SidebarGroup>
          <SidebarGroupLabel>Search</SidebarGroupLabel>
          <Input
            type="text"
            value={debouncedQuery}
            onChange={(e) => {
              const value = e.target.value.trim();
              if(value) setDebouncedQuery(e.target.value)
              else setDebouncedQuery("");
            }}
            placeholder="Search Your Desired blog"
          />

          <SidebarGroupLabel>Categories</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={() => setCategory("")}>
                <BoxSelect className={`${category === "" ? "bg-primary" : ""}`}/> <span>All</span>
              </SidebarMenuButton>
              {blogCategories?.map((e, i) => {
                return (
                  <SidebarMenuButton key={i} onClick={() => setCategory(e)}>
                    <BoxSelect className={`${category === e ? "bg-primary" : ""}`} /> <span>{e}</span>
                  </SidebarMenuButton>
                );
              })}
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default SideBar;