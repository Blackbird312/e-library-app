export interface User {
  id: number;
  fullName: string;
  email: string;
  membershipDate: string;
}

export interface Book {
  id: number;
  title: string;
  author?: string | null;
  isbn: string;
  availableCopies: number;
  coverImage?: string | null; 
}

export interface Loan {
  id: number;
  user: User;
  book: Book;
  loanDate: string;
  dueDate: string;
  returnDate: string | null;
  returned: boolean;
}
