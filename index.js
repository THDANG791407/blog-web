import express from "express";
import bodyParser from "body-parser";
import fs from "fs";
import path from "path";
import { dirname } from "path";
import { fileURLToPath } from "url";


const app = express();
const port = 3000;

// Thiết lập đường dẫn tuyệt đối
const __dirname = dirname(fileURLToPath(import.meta.url));


// cấu hình
app.use(express.static("public"));
app.use(express.json());
app.use(bodyParser.urlencoded({extended:true}));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

//Đường dẫn đến file post.json
const postsFilePath = path.join(__dirname, "data", "posts.json");

function getPosts() {
    if(!fs.existsSync(postsFilePath)) return [];
    const data = fs.readFileSync(postsFilePath, "utf-8");
    try {
        return JSON.parse(data || "[]"); 
    } catch(error) {
        console.error("❌ Lỗi đọc JSON:", error.message);
        return "[]";
    }
};

// hàm lưu bài viết
function savePosts(posts) {
    fs.writeFileSync(postsFilePath, JSON.stringify(posts,null,2));
};

//Trang chủ bài viết
app.get("/", (req, res)=> {
    const posts = getPosts();
    res.render("index", {posts});
});
//contact me
app.get("/post/contact",(req, res)=> {
    res.render("contact");
})

//Thêm bài viết mới
app.get("/post/new", (req, res)=> {
    res.render("post-new");
});

app.post("/post/new", (req, res)=> {
    const posts = getPosts();

    const newPosts = {
        id: Date.now(),
        title: req.body.title,
        category: req.body.category,
        image: req.body.image,
        content: req.body.content,
        createdAt: new Date().toISOString()
    };
    posts.unshift(newPosts) // thêm bài mới lên đầu
    savePosts(posts)

    res.redirect("/") //redirect về trang chủ hoặc trang hiển thị bài viết
});

// Chỉnh sửa bài viết
app.get("/post/edit/:id", (req, res)=> {
    const posts = getPosts();
    const post = posts.find(p => p.id == req.params.id);
    res.render("post-edit", {post});
});
app.post("/post/edit/:id", (req, res)=> {
    let posts = getPosts();
    const index = posts.findIndex(p => p.id == req.params.id);
    if (index !== -1) {
        posts[index].title = req.body.title
        posts[index].category = req.body.category
        posts[index].image = req.body.image
        posts[index].content = req.body.content
        savePosts(posts);
    }
    res.redirect("/");
});
// Xem bài viết
app.get("/post/:id", (req, res)=> {
    const posts = getPosts();
    const post = posts.find(p => p.id == req.params.id);
    if (!post) {
        return res.status(404).render("404",{message: "Bài viết không tồn tại"});
    }
    res.render("post-view", {post});
});
// Xóa bài viết
app.post("/post/delete/:id", (req, res)=> {
    let posts = getPosts();
    const id = req.params.id;
    posts = posts.filter(post => post.id != id);
    savePosts(posts);
    res.redirect("/");
});


app.listen(port, () => {
    console.log(`Sever runing on port ${port}`)
});