export async function POST(req) {
  try {
    const { email, password } = await req.json();

    // Perform your login logic here (e.g., check credentials in the database)
    if (email === "bhuvan.0101@gmail.com" && password === "123456") {
      return new Response(
        JSON.stringify({ message: "Login successful", token: "fake-jwt-token" }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({ message: "Invalid email or password" }),
      {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in login route:", error);
    return new Response(
      JSON.stringify({ message: "Internal Server Error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}