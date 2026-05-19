# Memorix — User Manual

**Version 1.0.0** · Cemetery Management Software

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Installation](#2-installation)
3. [License Activation](#3-license-activation)
4. [Initial Setup](#4-initial-setup)
5. [Logging In](#5-logging-in)
6. [Dashboard](#6-dashboard)
7. [Plots](#7-plots)
8. [Deceased Records](#8-deceased-records)
9. [Search](#9-search)
10. [PDF Reports](#10-pdf-reports)
11. [Settings](#11-settings)
12. [Labels & Categories](#12-labels--categories)
13. [License](#13-license)
14. [Frequently Asked Questions](#14-frequently-asked-questions)
15. [Support](#15-support)

---

## 1. Introduction

Memorix is a desktop application for the complete management of cemeteries. It allows you to manage plots, register deceased records, generate PDF reports, and view real-time statistics — all in a secure, fully offline environment.

### What can you do with Memorix?

- Manage a full inventory of plots with their statuses and locations
- Register and look up deceased records
- Assign deceased to plots quickly and easily
- Search any record in seconds
- Generate print-ready PDF documents
- View real-time occupancy statistics
- Customize the system with the zone and type names your organization uses

### Offline operation

Memorix stores all data on your own computer. No internet connection is needed to work. A connection is only required to activate your license and receive updates.

---

## 2. Installation

### System Requirements

| | Minimum |
|---|---|
| Operating System | Windows 10 (64-bit) or later |
| RAM | 256 MB |
| Disk Space | 150 MB free |
| Internet | Required only for activation and updates |

### Installation Steps

1. Download the installer `Memorix-Setup-1.0.0.exe` from the link you received after purchase.
2. Double-click the downloaded file.
3. If Windows shows a security warning, click **More info** and then **Run anyway**.
4. Follow the steps in the installation wizard.
5. When finished, Memorix will open automatically.

> **Note:** No additional software is required. Memorix includes everything it needs to run.

---

## 3. License Activation

When you open Memorix for the first time, you will see the license activation screen.

### How do I get my license key?

If you don't have a license yet, you can purchase one at:

**[memorix.lemonsqueezy.com/checkout](https://memorix.lemonsqueezy.com/checkout)**

Your license key will be sent to your email address immediately after payment.

### Activating your license

1. Copy the license key from your email.
2. Paste it into the **License key** field on the activation screen.
3. Click **Activate license**.
4. If the key is valid, the application will open immediately.

> **Important:** The license is tied to the machine where it is activated. If you need to move to a different computer, please contact support.

---

## 4. Initial Setup

The first time you open Memorix, a setup wizard will guide you through three steps.

### Step 1 — System Preferences

- **Language:** Choose between English and Spanish. All application text will switch to the selected language.
- **Theme:** Choose between Light mode and Dark mode.
- **Records per page:** Number of rows shown in tables (25, 50, or 100). The recommended value is 50.

Click **Next** when ready.

### Step 2 — Organization Details

Enter your cemetery or organization details. This information will appear on any PDF reports you generate.

- **Name** *(required)*: Name of the cemetery or company.
- **Address** *(optional)*: Full address.
- **Phone** *(optional)*: Contact number.

Click **Next** to continue.

### Step 3 — All Set

Memorix shows a summary of its main features. Click **Get started** to begin using the application.

> You can change any of these settings at any time from the **Settings** section.

---

## 5. Logging In

Every time you open Memorix, you will be prompted for a password before accessing the system.

- **Default password:** `1234`
- It is strongly recommended to change this on first use via **Settings → Security**.

### Changing your password

1. Go to **Settings** in the side menu.
2. Find the **Security** section.
3. Enter your current password and the new password twice.
4. Click **Save password**.

---

## 6. Dashboard

The dashboard is the main screen of Memorix. It shows a real-time summary of the cemetery's current status.

### Statistics cards

| Card | Description |
|---|---|
| **Total plots** | Total number of registered plots |
| **Occupied** | Plots currently assigned to a deceased record |
| **Available** | Plots that are free and ready to assign |
| **Deceased** | Total number of deceased records in the system |

Click any card to go directly to the corresponding section.

### Recent activity

At the bottom of the dashboard you will see the latest actions performed in the system: creations, edits, and deletions, each with a date and time.

If you have just installed the application and have no data yet, you will see a welcome message with shortcuts to get started.

---

## 7. Plots

The Plots section lets you manage all the spaces available in the cemetery.

### Viewing the plot list

Click **Plots** in the side menu. A table will show all registered plots, sortable by any column.

Each plot displays:
- **Code** — Unique identifier
- **Type** — Plot, Niche, Mausoleum, etc.
- **Zone** — Geographic grouping within the cemetery
- **Location** — Position within the zone
- **Status** — Available, Occupied, Reserved, Maintenance
- **Assigned deceased** — If occupied, the name of the deceased

### Adding a plot

1. Click **+ New plot**.
2. Fill in the form:
   - **Code** *(required)*: Unique identifier. E.g.: `A-001`, `N-012`.
   - **Type**: Select the type of space.
   - **Zone and Location**: Select from the configured categories.
   - **Initial status**: Normally "Available".
   - **Price** *(optional)*: Cost of the plot.
   - **Notes** *(optional)*: Additional observations.
3. Click **Save**.

### Editing a plot

1. Click the **edit** icon (pencil) on the plot's row.
2. Modify the necessary fields.
3. Click **Save**.

### Deleting a plot

1. Click the **delete** icon (trash) on the plot's row.
2. Confirm the deletion in the dialog.

> **Note:** You cannot delete a plot that has a deceased record assigned to it. You must first reassign or delete that deceased record.

### Plot statuses

| Status | Meaning |
|---|---|
| **Available** | The plot is free and can be assigned |
| **Occupied** | A deceased record is currently assigned to it |
| **Reserved** | Reserved but not yet occupied |
| **Maintenance** | Temporarily out of service |

The status changes automatically to **Occupied** when you assign a deceased record to the plot, and returns to **Available** when that record is deleted or reassigned.

---

## 8. Deceased Records

The Deceased section manages all records of people registered in the system.

### Viewing the deceased list

Click **Deceased** in the side menu. The table shows all records with their main details.

### Adding a deceased record

1. Click **+ New deceased**.
2. Fill in the form:

**Personal details**
- **Full name** *(required)*
- **ID / Identity document** *(optional)*
- **Date of birth** *(optional)*
- **Place of birth** *(optional)*

**Death details**
- **Date of death** *(optional)*
- **Cause of death** *(optional)*

**Assignment**
- **Plot**: Select an available plot from the dropdown. The plot will automatically change to Occupied status.

**Additional notes** *(optional)*

3. Click **Save**.

### Editing a deceased record

1. Click the **edit** icon on the record's row.
2. Make the necessary changes.
3. Click **Save**.

### Deleting a deceased record

1. Click the **delete** icon on the record's row.
2. Confirm in the dialog.

> When you delete a deceased record that had a plot assigned, that plot automatically returns to **Available** status.

---

## 9. Search

The search feature lets you find any record quickly across all data in the system.

### How to search

1. Click **Search** in the side menu.
2. Type any term in the search field: name, surname, plot code, ID number, etc.
3. Results appear automatically as you type.

### Available filters

You can combine several criteria at once:
- **Name / Surname**
- **Date of death** (from / to)
- **Assigned plot**

### Actions from search results

From the results table you can edit or delete any record directly, without navigating to the corresponding section.

---

## 10. PDF Reports

Memorix lets you generate PDF documents from any list for printing or archiving.

### Generating a report

1. Go to the section you want to export: Plots, Deceased, or Search.
2. Apply any filters or sorting you need.
3. Click the **Export PDF** or **Print** button.
4. A document preview will open.
5. From the preview you can print directly or save as a PDF file.

### Report contents

Each report automatically includes:
- Your organization's name (configured in Settings)
- Date and time of generation
- Table with all visible records
- Total record count

---

## 11. Settings

Access settings from the gear icon in the side menu.

### Organization

Your company or cemetery details that appear on PDF reports.

- **Organization name**
- **Address**
- **Phone**

Click **Save changes** after modifying any field.

### Appearance

- **Theme**: Switch between Light and Dark mode at any time.
- **Language**: Toggle between English and Spanish. The change is instant.
- **Records per page**: Control how many rows are shown in tables.

### Security

- **Change password**: Enter your current password and the new password twice.

### System

Shows information about the application version and operating system.

---

## 12. Labels & Categories

Labels let you customize the available values for the **Type**, **Zone**, and **Location** fields of plots, adapting them to the terminology your organization uses.

### Managing labels

1. Go to **Settings** and find the **Labels & Categories** section.
2. You will see three groups: **Plot type**, **Zone**, and **Location**.

### Adding a value

1. Click **+ Add** inside the relevant group.
2. Type the new value (e.g.: `North Sector`, `Crypt`, `Row 3`).
3. Press Enter or click confirm.

### Deleting a value

Click the **X** next to the value you want to remove.

> **Warning:** You cannot delete a value that is currently used by one or more plots. You must update those plots first.

### Default values

When Memorix is installed, the following values are created automatically based on the language chosen during setup:

| Group | English values | Spanish values |
|---|---|---|
| Type | Plot, Niche, Mausoleum | Parcela, Nicho, Mausoleo |
| Zone | New, Old | Nuevo, Antiguo |
| Location | Left, Center, Right | Izquierda, Centro, Derecha |

---

## 13. License

### Viewing your license status

Go to **Settings** and find the **License** card. You will see:
- Whether the license is active
- The email address used for the purchase
- The expiry date (if applicable)

### Renewing your license

When your license expires, you will see a notice when opening the application. You can renew it at the store:

**[memorix.lemonsqueezy.com/checkout](https://memorix.lemonsqueezy.com/checkout)**

### Deactivating your license

If you need to move Memorix to a different computer:

1. Go to **Settings → License**.
2. Click **Deactivate license**.
3. Confirm the action.
4. The application will close. You can now activate the same key on the new computer.

---

## 14. Frequently Asked Questions

**Where is my data stored?**
All data is stored on your computer, in the Windows user data folder (`%APPDATA%\memorix\`). No data is sent to any external server.

**Can I use Memorix without internet?**
Yes. Once the license is activated, the application works completely offline. Internet is only needed to activate the license and receive updates.

**How do I back up my data?**
Copy the file `cementerio.db` found in `%APPDATA%\memorix\` to a safe location (external drive, cloud storage, etc.). To restore, simply copy the file back to the same folder.

**I forgot my password. What do I do?**
Contact support at **bblottus@gmail.com** and include your organization name. We will provide instructions to reset access.

**Can I install Memorix on more than one computer?**
The license allows one active installation at a time. If you need to switch computers, deactivate the license on the current machine before activating it on the new one.

**Are updates free?**
Yes. All updates published during your active license period are installed automatically when you open the application.

**What happens to my data if I don't renew my license?**
Your data stays on your computer. If you decide to renew in the future, the application will recover everything exactly as you left it.

---

## 15. Support

If you have any questions, technical issues, or need help with setup, please contact us:

📧 **bblottus@gmail.com**

Please include in your message:
- Description of the issue or question
- Memorix version (visible in Settings → System)
- Your Windows version

Typical response time: **1–2 business days**.

---

<div align="center">

**Memorix v1.0.0** — Professional Cemetery Management Software

*Thank you for choosing Memorix.*

</div>
